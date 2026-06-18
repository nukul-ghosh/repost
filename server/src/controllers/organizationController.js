const { validationResult } = require('express-validator');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Create organization
// @route   POST /api/organizations
// @access  Private
exports.createOrganization = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      name,
      tagline,
      description,
      industry,
      companySize,
      foundedYear,
      website,
      email,
      phone,
      headquarters,
      socialLinks
    } = req.body;

    // Check if organization with this name already exists
    const existingOrg = await Organization.findOne({ name });
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Organization with this name already exists'
      });
    }

    // Create organization with creator as owner
    const organization = await Organization.create({
      name,
      tagline,
      description,
      industry,
      companySize,
      foundedYear,
      website,
      email,
      phone,
      headquarters,
      socialLinks,
      admins: [
        {
          user: req.user.id,
          role: 'owner'
        }
      ]
    });

    await organization.populate('admins.user', 'firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      organization
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization by ID or slug
// @route   GET /api/organizations/:id
// @access  Public
exports.getOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Try to find by ID first, then by slug
    let organization = await Organization.findById(id)
      .populate('admins.user', 'firstName lastName profilePicture headline')
      .populate('employees.user', 'firstName lastName profilePicture headline')
      .populate('employees.verifiedBy', 'firstName lastName');

    if (!organization) {
      organization = await Organization.findOne({ slug: id })
        .populate('admins.user', 'firstName lastName profilePicture headline')
        .populate('employees.user', 'firstName lastName profilePicture headline')
        .populate('employees.verifiedBy', 'firstName lastName');
    }

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is admin
    const isAdmin = req.user && organization.admins.some(
      (admin) => admin.user._id.toString() === req.user.id
    );

    // Respect privacy settings for non-admins
    if (!isAdmin) {
      if (!organization.privacySettings.showEmployees) {
        organization.employees = [];
      }
    }

    res.json({
      success: true,
      organization,
      isAdmin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private (admins only)
exports.updateOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is admin
    const isAdmin = organization.admins.some(
      (admin) => admin.user.toString() === req.user.id
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this organization'
      });
    }

    const allowedUpdates = [
      'name',
      'tagline',
      'description',
      'industry',
      'companySize',
      'foundedYear',
      'website',
      'email',
      'phone',
      'headquarters',
      'socialLinks',
      'logo',
      'coverImage',
      'privacySettings'
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        organization[field] = req.body[field];
      }
    });

    await organization.save();

    res.json({
      success: true,
      organization
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private (owner only)
exports.deleteOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is owner
    const isOwner = organization.admins.some(
      (admin) =>
        admin.user.toString() === req.user.id && admin.role === 'owner'
    );

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only organization owner can delete the organization'
      });
    }

    await organization.deleteOne();

    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add employee to organization
// @route   POST /api/organizations/:id/employees
// @access  Private (admins only)
exports.addEmployee = async (req, res, next) => {
  try {
    const { userId, position, department, joinedAt } = req.body;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is admin
    const isAdmin = organization.admins.some(
      (admin) => admin.user.toString() === req.user.id
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add employees'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already an employee
    const existingEmployee = organization.employees.find(
      (emp) => emp.user.toString() === userId
    );

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'User is already an employee'
      });
    }

    // Add employee
    organization.employees.push({
      user: userId,
      position,
      department,
      joinedAt: joinedAt || new Date(),
      isVerified: false
    });

    organization.employeeCount = organization.employees.length;
    await organization.save();

    await organization.populate('employees.user', 'firstName lastName profilePicture');

    res.json({
      success: true,
      organization,
      message: 'Employee added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove employee from organization
// @route   DELETE /api/organizations/:id/employees/:userId
// @access  Private (admins only)
exports.removeEmployee = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is admin
    const isAdmin = organization.admins.some(
      (admin) => admin.user.toString() === req.user.id
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove employees'
      });
    }

    // Find and remove employee
    const employeeIndex = organization.employees.findIndex(
      (emp) => emp.user.toString() === userId
    );

    if (employeeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    organization.employees.splice(employeeIndex, 1);
    organization.employeeCount = organization.employees.length;
    await organization.save();

    res.json({
      success: true,
      message: 'Employee removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify employee
// @route   PUT /api/organizations/:id/employees/:userId/verify
// @access  Private (admins only)
exports.verifyEmployee = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is admin
    const isAdmin = organization.admins.some(
      (admin) => admin.user.toString() === req.user.id
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify employees'
      });
    }

    // Find employee
    const employee = organization.employees.find(
      (emp) => emp.user.toString() === userId
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Verify employee
    employee.isVerified = true;
    employee.verifiedBy = req.user.id;
    employee.verifiedAt = new Date();

    await organization.save();

    res.json({
      success: true,
      organization,
      message: 'Employee verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add admin to organization
// @route   POST /api/organizations/:id/admins
// @access  Private (owner only)
exports.addAdmin = async (req, res, next) => {
  try {
    const { userId, role } = req.body;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is owner
    const isOwner = organization.admins.some(
      (admin) =>
        admin.user.toString() === req.user.id && admin.role === 'owner'
    );

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only organization owner can add admins'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already an admin
    const existingAdmin = organization.admins.find(
      (admin) => admin.user.toString() === userId
    );

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'User is already an admin'
      });
    }

    // Add admin
    organization.admins.push({
      user: userId,
      role: role || 'admin'
    });

    await organization.save();
    await organization.populate('admins.user', 'firstName lastName profilePicture');

    res.json({
      success: true,
      organization,
      message: 'Admin added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove admin from organization
// @route   DELETE /api/organizations/:id/admins/:userId
// @access  Private (owner only)
exports.removeAdmin = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is owner
    const isOwner = organization.admins.some(
      (admin) =>
        admin.user.toString() === req.user.id && admin.role === 'owner'
    );

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only organization owner can remove admins'
      });
    }

    // Cannot remove owner
    const targetAdmin = organization.admins.find(
      (admin) => admin.user.toString() === userId
    );

    if (targetAdmin && targetAdmin.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove organization owner'
      });
    }

    // Find and remove admin
    const adminIndex = organization.admins.findIndex(
      (admin) => admin.user.toString() === userId
    );

    if (adminIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    organization.admins.splice(adminIndex, 1);
    await organization.save();

    res.json({
      success: true,
      message: 'Admin removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization employees
// @route   GET /api/organizations/:id/employees
// @access  Public (respects privacy settings)
exports.getEmployees = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 20, skip = 0, verified } = req.query;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check privacy settings
    const isAdmin = req.user && organization.admins.some(
      (admin) => admin.user.toString() === req.user.id
    );

    if (!isAdmin && !organization.privacySettings.showEmployees) {
      return res.status(403).json({
        success: false,
        message: 'Employee list is private'
      });
    }

    let employees = organization.employees;

    // Filter by verification status
    if (verified !== undefined) {
      employees = employees.filter(
        (emp) => emp.isVerified === (verified === 'true')
      );
    }

    // Paginate
    const total = employees.length;
    employees = employees.slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    // Populate user details
    await Organization.populate(employees, {
      path: 'user',
      select: 'firstName lastName profilePicture headline'
    });

    res.json({
      success: true,
      employees,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization projects
// @route   GET /api/organizations/:id/projects
// @access  Public (respects privacy settings)
exports.getOrganizationProjects = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check privacy settings
    const isAdmin = req.user && organization.admins.some(
      (admin) => admin.user.toString() === req.user.id
    );

    if (!isAdmin && !organization.privacySettings.showProjects) {
      return res.status(403).json({
        success: false,
        message: 'Project list is private'
      });
    }

    // Find projects claimed by this organization
    const projects = await Project.find({
      'organizations.organization': id,
      'organizations.status': 'approved'
    })
      .populate('createdBy', 'firstName lastName profilePicture')
      .sort({ startDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Project.countDocuments({
      'organizations.organization': id,
      'organizations.status': 'approved'
    });

    res.json({
      success: true,
      projects,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search organizations
// @route   GET /api/organizations/search
// @access  Public
exports.searchOrganizations = async (req, res, next) => {
  try {
    const { q, industry, location, limit = 20, skip = 0 } = req.query;

    const query = { isActive: true };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Filter by industry
    if (industry) {
      query.industry = industry;
    }

    // Filter by location
    if (location) {
      query['headquarters.city'] = new RegExp(location, 'i');
    }

    const organizations = await Organization.find(query)
      .select('name slug logo tagline industry headquarters employeeCount')
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Organization.countDocuments(query);

    res.json({
      success: true,
      organizations,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all organizations (list)
// @route   GET /api/organizations
// @access  Public
exports.getAllOrganizations = async (req, res, next) => {
  try {
    const { limit = 20, skip = 0, industry } = req.query;

    const query = { isActive: true };

    if (industry) {
      query.industry = industry;
    }

    const organizations = await Organization.find(query)
      .select('name slug logo tagline industry headquarters employeeCount watchersCount')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Organization.countDocuments(query);

    res.json({
      success: true,
      organizations,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
