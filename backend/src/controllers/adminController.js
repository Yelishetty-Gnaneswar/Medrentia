import User from '../models/User.js';
import Equipment from '../models/Equipment.js';
import Order from '../models/Order.js';
import Rental from '../models/Rental.js';
import Payment from '../models/Payment.js';

// @desc    Get Admin Overview Statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalEquipment = await Equipment.countDocuments();
    const totalRentals = await Rental.countDocuments();
    const activeRentals = await Rental.countDocuments({ status: 'Active' });

    const payments = await Payment.find({ status: 'captured' });
    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    const recentUsers = await User.find().sort('-createdAt').limit(5);
    const recentOrders = await Order.find()
      .populate('customer', 'name email')
      .sort('-createdAt')
      .limit(5);

    const platformMetrics = {
      totalUsers,
      totalProviders,
      totalEquipment,
      totalRentals,
      activeRentals,
      totalRevenue,
      recentUsers,
      recentOrders,
    };

    res.status(200).json({
      success: true,
      data: platformMetrics,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user active / suspended status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User has been ${user.isActive ? 'activated' : 'suspended'}`,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
