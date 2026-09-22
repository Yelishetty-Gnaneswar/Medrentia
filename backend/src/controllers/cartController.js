import Cart from '../models/Cart.js';
import Equipment from '../models/Equipment.js';

// Helper to calculate price based on duration
const calculatePrice = (equipment, duration, units = 1) => {
  let pricePerUnit = equipment.dailyPrice;
  if (duration === 'weekly') pricePerUnit = equipment.weeklyPrice;
  if (duration === 'monthly') pricePerUnit = equipment.monthlyPrice;
  if (duration === 'sixMonth') pricePerUnit = equipment.sixMonthPrice || Math.round(equipment.monthlyPrice * 5.2);
  if (duration === 'yearly') pricePerUnit = equipment.yearlyPrice || Math.round(equipment.monthlyPrice * 9.5);
  return pricePerUnit * units;
};

// Helper to calculate rental end date
const calculateEndDate = (startDate, duration, units = 1) => {
  const end = new Date(startDate || Date.now());
  if (duration === 'daily') end.setDate(end.getDate() + (1 * units));
  else if (duration === 'weekly') end.setDate(end.getDate() + (7 * units));
  else if (duration === 'monthly') end.setMonth(end.getMonth() + (1 * units));
  else if (duration === 'sixMonth') end.setMonth(end.getMonth() + (6 * units));
  else if (duration === 'yearly') end.setFullYear(end.getFullYear() + (1 * units));
  else end.setDate(end.getDate() + 7);
  return end;
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.equipment');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const {
      equipmentId,
      rentalDuration = 'weekly',
      durationUnits = 1,
      quantity = 1,
      rentalStartDate = new Date(),
    } = req.body;

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    if (equipment.availableQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${equipment.availableQuantity} units available right now.`,
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const calculatedRentalPrice = calculatePrice(equipment, rentalDuration, durationUnits);
    const calculatedEndDate = calculateEndDate(rentalStartDate, rentalDuration, durationUnits);

    // Check if equipment already in cart with same duration
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.equipment.toString() === equipmentId &&
        item.rentalDuration === rentalDuration
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
      cart.items[existingIndex].rentalPrice = calculatePrice(
        equipment,
        rentalDuration,
        cart.items[existingIndex].durationUnits
      ) * cart.items[existingIndex].quantity;
    } else {
      cart.items.push({
        equipment: equipment._id,
        equipmentName: equipment.name,
        equipmentImage: equipment.images[0],
        categoryName: equipment.categoryName,
        rentalDuration,
        durationUnits,
        rentalPrice: calculatedRentalPrice * quantity,
        securityDeposit: equipment.securityDeposit * quantity,
        deliveryFee: equipment.deliveryFee || 150,
        quantity,
        rentalStartDate: new Date(rentalStartDate),
        rentalEndDate: calculatedEndDate,
        provider: equipment.provider,
      });
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.equipment');

    res.status(200).json({
      success: true,
      message: 'Item added to rental cart',
      data: updatedCart,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cart item duration or quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { rentalDuration, durationUnits = 1, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    const equipment = await Equipment.findById(item.equipment);
    if (equipment) {
      if (quantity !== undefined) item.quantity = Math.max(1, Number(quantity));
      if (rentalDuration) item.rentalDuration = rentalDuration;
      if (durationUnits) item.durationUnits = Number(durationUnits);

      item.rentalPrice = calculatePrice(equipment, item.rentalDuration, item.durationUnits) * item.quantity;
      item.securityDeposit = equipment.securityDeposit * item.quantity;
      item.rentalEndDate = calculateEndDate(item.rentalStartDate, item.rentalDuration, item.durationUnits);
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.equipment');

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: updatedCart,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.equipment');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: updatedCart,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $set: { items: [] } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};
