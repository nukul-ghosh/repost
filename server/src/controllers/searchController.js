const User = require('../models/User');
const Project = require('../models/Project');
const Organization = require('../models/Organization');
const Event = require('../models/Event');

// @desc    Universal search (users, projects, organizations)
// @route   GET /api/search
// @access  Public
exports.universalSearch = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchLimit = parseInt(limit);

    // Search users
    const users = await User.find({
      $text: { $search: q },
      isActive: true
    })
      .select('firstName lastName profilePicture headline location')
      .limit(searchLimit)
      .sort({ score: { $meta: 'textScore' } });

    // Search projects
    const projects = await Project.find({
      $text: { $search: q },
      visibility: { $in: ['public', 'connectionsOnly'] }
    })
      .select('title slug description category technologies')
      .populate('createdBy', 'firstName lastName')
      .limit(searchLimit)
      .sort({ score: { $meta: 'textScore' } });

    // Search organizations
    const organizations = await Organization.find({
      $text: { $search: q },
      isActive: true
    })
      .select('name slug logo tagline industry')
      .limit(searchLimit)
      .sort({ score: { $meta: 'textScore' } });

    res.json({
      success: true,
      results: {
        users,
        projects,
        organizations,
        total: users.length + projects.length + organizations.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/search/users
// @access  Public
exports.searchUsers = async (req, res, next) => {
  try {
    const {
      q,
      skills,
      location,
      headline,
      limit = 20,
      skip = 0,
      sortBy = 'relevance'
    } = req.query;

    const query = { isActive: true };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Filter by skills (events with eventType: 'skill')
    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim());
      const userIdsWithSkills = await Event.distinct('user', {
        eventType: 'skill',
        title: { $in: skillsArray },
        status: 'approved'
      });
      query._id = { $in: userIdsWithSkills };
    }

    // Filter by location
    if (location) {
      query.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.country': new RegExp(location, 'i') }
      ];
    }

    // Filter by headline
    if (headline) {
      query.headline = new RegExp(headline, 'i');
    }

    // Build sort
    let sort = {};
    if (sortBy === 'relevance' && q) {
      sort = { score: { $meta: 'textScore' } };
    } else if (sortBy === 'connections') {
      sort = { connectionsCount: -1 };
    } else if (sortBy === 'recent') {
      sort = { createdAt: -1 };
    }

    const users = await User.find(query)
      .select('firstName lastName profilePicture headline location connectionsCount')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
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

// @desc    Search projects
// @route   GET /api/search/projects
// @access  Public
exports.searchProjects = async (req, res, next) => {
  try {
    const {
      q,
      category,
      technologies,
      status,
      limit = 20,
      skip = 0,
      sortBy = 'relevance'
    } = req.query;

    const query = {
      visibility: { $in: ['public', 'connectionsOnly'] }
    };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by technologies
    if (technologies) {
      const techArray = technologies.split(',').map((t) => t.trim());
      query.technologies = { $in: techArray };
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Build sort
    let sort = {};
    if (sortBy === 'relevance' && q) {
      sort = { score: { $meta: 'textScore' } };
    } else if (sortBy === 'recent') {
      sort = { startDate: -1 };
    } else if (sortBy === 'views') {
      sort = { viewsCount: -1 };
    }

    const projects = await Project.find(query)
      .select('title slug description category technologies status startDate viewsCount')
      .populate('createdBy', 'firstName lastName profilePicture')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Project.countDocuments(query);

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
// @route   GET /api/search/organizations
// @access  Public
exports.searchOrganizations = async (req, res, next) => {
  try {
    const {
      q,
      industry,
      location,
      companySize,
      limit = 20,
      skip = 0,
      sortBy = 'relevance'
    } = req.query;

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
      query.$or = [
        { 'headquarters.city': new RegExp(location, 'i') },
        { 'headquarters.country': new RegExp(location, 'i') }
      ];
    }

    // Filter by company size
    if (companySize) {
      query.companySize = companySize;
    }

    // Build sort
    let sort = {};
    if (sortBy === 'relevance' && q) {
      sort = { score: { $meta: 'textScore' } };
    } else if (sortBy === 'employees') {
      sort = { employeeCount: -1 };
    } else if (sortBy === 'recent') {
      sort = { createdAt: -1 };
    }

    const organizations = await Organization.find(query)
      .select('name slug logo tagline industry headquarters employeeCount watchersCount')
      .sort(sort)
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

// @desc    Get skill suggestions (autocomplete)
// @route   GET /api/search/skills
// @access  Public
exports.suggestSkills = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        skills: []
      });
    }

    // Get distinct skill titles from approved skill events
    const skills = await Event.distinct('title', {
      eventType: 'skill',
      status: 'approved',
      title: new RegExp(q, 'i')
    }).limit(parseInt(limit));

    // Count occurrences for each skill
    const skillsWithCounts = await Promise.all(
      skills.map(async (skill) => {
        const count = await Event.countDocuments({
          eventType: 'skill',
          title: skill,
          status: 'approved'
        });
        return { skill, count };
      })
    );

    // Sort by count (most popular first)
    skillsWithCounts.sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      skills: skillsWithCounts.slice(0, parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get technology suggestions (autocomplete)
// @route   GET /api/search/technologies
// @access  Public
exports.suggestTechnologies = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        technologies: []
      });
    }

    // Get distinct technologies from projects
    const technologies = await Project.aggregate([
      { $unwind: '$technologies' },
      {
        $match: {
          technologies: new RegExp(q, 'i')
        }
      },
      {
        $group: {
          _id: '$technologies',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      technologies: technologies.map((t) => ({
        technology: t._id,
        count: t.count
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Advanced search with filters
// @route   GET /api/search/advanced
// @access  Public
exports.advancedSearch = async (req, res, next) => {
  try {
    const {
      q,
      type, // 'users', 'projects', 'organizations', 'all'
      filters,
      limit = 20,
      skip = 0
    } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    let results = {};

    // Parse filters if provided
    const parsedFilters = filters ? JSON.parse(filters) : {};

    switch (type) {
      case 'users':
        results.users = await searchUsersAdvanced(q, parsedFilters, limit, skip);
        break;

      case 'projects':
        results.projects = await searchProjectsAdvanced(q, parsedFilters, limit, skip);
        break;

      case 'organizations':
        results.organizations = await searchOrganizationsAdvanced(
          q,
          parsedFilters,
          limit,
          skip
        );
        break;

      case 'all':
      default:
        results.users = await searchUsersAdvanced(q, parsedFilters, 5, 0);
        results.projects = await searchProjectsAdvanced(q, parsedFilters, 5, 0);
        results.organizations = await searchOrganizationsAdvanced(q, parsedFilters, 5, 0);
        break;
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions for advanced search
async function searchUsersAdvanced(query, filters, limit, skip) {
  const searchQuery = {
    $text: { $search: query },
    isActive: true
  };

  if (filters.location) {
    searchQuery['location.city'] = new RegExp(filters.location, 'i');
  }

  if (filters.headline) {
    searchQuery.headline = new RegExp(filters.headline, 'i');
  }

  const users = await User.find(searchQuery)
    .select('firstName lastName profilePicture headline location')
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await User.countDocuments(searchQuery);

  return { data: users, total };
}

async function searchProjectsAdvanced(query, filters, limit, skip) {
  const searchQuery = {
    $text: { $search: query },
    visibility: { $in: ['public', 'connectionsOnly'] }
  };

  if (filters.category) {
    searchQuery.category = filters.category;
  }

  if (filters.technologies) {
    searchQuery.technologies = { $in: filters.technologies };
  }

  const projects = await Project.find(searchQuery)
    .select('title slug description category technologies')
    .populate('createdBy', 'firstName lastName')
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await Project.countDocuments(searchQuery);

  return { data: projects, total };
}

async function searchOrganizationsAdvanced(query, filters, limit, skip) {
  const searchQuery = {
    $text: { $search: query },
    isActive: true
  };

  if (filters.industry) {
    searchQuery.industry = filters.industry;
  }

  if (filters.companySize) {
    searchQuery.companySize = filters.companySize;
  }

  const organizations = await Organization.find(searchQuery)
    .select('name slug logo tagline industry')
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await Organization.countDocuments(searchQuery);

  return { data: organizations, total };
}
