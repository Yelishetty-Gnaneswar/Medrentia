import mongoose from 'mongoose';
import Equipment from '../models/Equipment.js';
import Category from '../models/Category.js';
import { uploadImageToCloudinary } from '../services/cloudinaryService.js';

// @desc    Get all equipment with advanced search & filtering
// @route   GET /api/equipment
// @access  Public
export const getEquipment = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      duration,
      condition,
      availability,
      city,
      rating,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isApproved: true };

    // Search by name, description
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { shortDescription: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { categoryName: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by category (by id or slug or name)
    if (category && category !== 'all') {
      const foundCategory = await Category.findOne({
        $or: [{ slug: category }, { name: category }],
      });
      if (foundCategory) {
        query.category = foundCategory._id;
      } else if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      }
    }

    // Price range filter
    const priceField =
      duration === 'weekly'
        ? 'weeklyPrice'
        : duration === 'monthly'
        ? 'monthlyPrice'
        : 'dailyPrice';

    if (minPrice || maxPrice) {
      query[priceField] = {};
      if (minPrice) query[priceField].$gte = Number(minPrice);
      if (maxPrice) query[priceField].$lte = Number(maxPrice);
    }

    // Condition filter
    if (condition && condition !== 'all') {
      query.condition = condition;
    }

    // Availability filter
    if (availability && availability !== 'all') {
      query.availability = availability;
    }

    // City filter
    if (city && city !== 'all') {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Sorting
    let sortBy = '-createdAt';
    if (sort === 'price-low') sortBy = priceField;
    if (sort === 'price-high') sortBy = `-${priceField}`;
    if (sort === 'rating') sortBy = '-rating';
    if (sort === 'popular') sortBy = '-totalRentals';

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const startIndex = (pageNum - 1) * limitNum;

    const total = await Equipment.countDocuments(query);
    const equipment = await Equipment.find(query)
      .populate('category', 'name slug iconName')
      .populate('provider', 'name companyName email phone profileImage')
      .sort(sortBy)
      .skip(startIndex)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: equipment.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: equipment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get featured equipment for landing page
// @route   GET /api/equipment/featured
// @access  Public
export const getFeaturedEquipment = async (req, res, next) => {
  try {
    const featured = await Equipment.find({ isApproved: true })
      .populate('category', 'name slug')
      .populate('provider', 'name companyName')
      .sort('-rating -totalRentals')
      .limit(8);

    res.status(200).json({
      success: true,
      data: featured,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single equipment by ID
// @route   GET /api/equipment/:id
// @access  Public
export const getEquipmentById = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('category', 'name slug iconName description')
      .populate('provider', 'name companyName email phone profileImage address');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: `Equipment not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new equipment (Provider or Admin)
// @route   POST /api/equipment
// @access  Private (Provider/Admin)
export const createEquipment = async (req, res, next) => {
  try {
    req.body.provider = req.user.id;
    req.body.providerName = req.user.companyName || req.user.name;

    // Verify category safely
    let categoryDoc = null;
    if (req.body.category && mongoose.Types.ObjectId.isValid(req.body.category)) {
      categoryDoc = await Category.findById(req.body.category);
    }
    if (!categoryDoc && req.body.categoryName) {
      categoryDoc = await Category.findOne({ name: req.body.categoryName });
    }
    if (!categoryDoc) {
      // Find fallback category
      categoryDoc = await Category.findOne({ isActive: true });
    }

    if (categoryDoc) {
      req.body.category = categoryDoc._id;
      req.body.categoryName = categoryDoc.name;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid healthcare category.',
      });
    }

    // Default calculations if not provided
    if (!req.body.weeklyPrice && req.body.dailyPrice) {
      req.body.weeklyPrice = Math.round(req.body.dailyPrice * 6);
    }
    if (!req.body.monthlyPrice && req.body.dailyPrice) {
      req.body.monthlyPrice = Math.round(req.body.dailyPrice * 22);
    }
    if (!req.body.sixMonthPrice && req.body.monthlyPrice) {
      req.body.sixMonthPrice = Math.round(req.body.monthlyPrice * 5.2);
    }
    if (!req.body.yearlyPrice && req.body.monthlyPrice) {
      req.body.yearlyPrice = Math.round(req.body.monthlyPrice * 9.5);
    }
    if (!req.body.availableQuantity && req.body.quantity) {
      req.body.availableQuantity = req.body.quantity;
    }

    const equipment = await Equipment.create(req.body);

    // Update category item count
    if (categoryDoc) {
      await Category.findByIdAndUpdate(categoryDoc._id, { $inc: { itemCount: 1 } });
    }

    res.status(201).json({
      success: true,
      message: 'Medical equipment listed successfully',
      data: equipment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private (Provider/Admin)
export const updateEquipment = async (req, res, next) => {
  try {
    let equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    // Ensure user is equipment provider or admin
    if (equipment.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this equipment listing',
      });
    }

    equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Equipment listing updated successfully',
      data: equipment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private (Provider/Admin)
export const deleteEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    if (equipment.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this equipment listing',
      });
    }

    await equipment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Equipment listing removed',
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload equipment image
// @route   POST /api/equipment/upload-image
// @access  Private (Provider/Admin)
export const uploadEquipmentImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    const imageUrl = await uploadImageToCloudinary(req.file.buffer, 'medrentia/equipment', req.file.mimetype);

    res.status(200).json({
      success: true,
      imageUrl,
    });
  } catch (err) {
    next(err);
  }
};
