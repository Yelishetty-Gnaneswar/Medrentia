import Category from '../models/Category.js';
import Equipment from '../models/Equipment.js';

// @desc    Get all categories with equipment count
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');

    // Dynamically calculate accurate equipment counts
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Equipment.countDocuments({ category: cat._id, isApproved: true });
        return {
          ...cat.toObject(),
          itemCount: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
};
