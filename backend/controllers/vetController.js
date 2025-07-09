const Veterinarian = require("../models/vetModel")
const User = require("../models/userModel")
const HttpError = require("../models/http-error")
const { validationResult } = require("express-validator")
const { deleteFromCloudinary } = require("../config/cloudinary")

exports.getNearbyVets = async (req, res, next) => {
  const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
  const { lat, lng, radius } = req.body;
  
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="veterinary"](around:${radius},${lat},${lng});
      node["healthcare"="veterinary"](around:${radius},${lat},${lng});
      node["healthcare"="animal_hospital"](around:${radius},${lat},${lng});
      way["amenity"="veterinary"](around:${radius},${lat},${lng});
      way["healthcare"="veterinary"](around:${radius},${lat},${lng});
      way["healthcare"="animal_hospital"](around:${radius},${lat},${lng});
      rel["amenity"="veterinary"](around:${radius},${lat},${lng});
      rel["healthcare"="veterinary"](around:${radius},${lat},${lng});
      rel["healthcare"="animal_hospital"](around:${radius},${lat},${lng});
    );
    out center tags;
  `;

  try {
    const osres = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' },
    });

    if (!osres.ok) throw new Error(`OSM error ${osres.status}`);
    
    const { elements } = await osres.json();
    
    const data = elements.map((el) => {
      const { id, tags = {}, lat: nLat, lon: nLon, center } = el;
      
      // For ways/relations use center coordinates
      const itemLat = nLat ?? center?.lat;
      const itemLon = nLon ?? center?.lon;
      
      // Extract name with fallback options
      const name = tags.name || 
                  tags['name:en'] || 
                  tags.brand || 
                  tags['healthcare:speciality'] || 
                  null;
      
      // Build comprehensive address string
      const addressParts = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:neighbourhood'],
        tags['addr:suburb'],
        tags['addr:city'],
        tags['addr:state'],
        tags['addr:postcode'],
        tags['addr:country']
      ].filter(Boolean);
      
      const address = addressParts.length > 0 ? addressParts.join(', ') : null;
      
      // Extract additional useful information
      const phone = tags.phone || tags['contact:phone'] || null;
      const website = tags.website || tags['contact:website'] || null;
      const email = tags.email || tags['contact:email'] || null;
      const openingHours = tags.opening_hours || null;
      
      // Determine facility type for better categorization
      let facilityType = 'Veterinary Clinic';
      if (tags.healthcare === 'animal_hospital' || tags.name?.toLowerCase().includes('hospital')) {
        facilityType = 'Animal Hospital';
      } else if (tags.healthcare === 'veterinary' || tags.amenity === 'veterinary') {
        facilityType = 'Veterinary Clinic';
      }
      
      // Emergency services indicator
      const isEmergency = tags.emergency === 'yes' || 
                         tags['healthcare:speciality']?.includes('emergency') ||
                         tags.name?.toLowerCase().includes('emergency') ||
                         tags.name?.toLowerCase().includes('24') ||
                         false;
      
      return {
        id: `${el.type}/${id}`,
        name,
        address,
        lat: itemLat,
        lon: itemLon,
        phone,
        website,
        email,
        openingHours,
        facilityType,
        isEmergency,
        // Additional metadata
        tags: {
          amenity: tags.amenity,
          healthcare: tags.healthcare,
          operator: tags.operator,
          brand: tags.brand
        }
      };
    })
    .filter(item => item.lat && item.lon) // Filter out items without coordinates
    .sort((a, b) => {
      // Sort by emergency services first, then by name
      if (a.isEmergency && !b.isEmergency) return -1;
      if (!a.isEmergency && b.isEmergency) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });

    return res.json({
      success: true,
      message: 'Fetched nearby veterinary clinics and animal hospitals',
      data,
      count: data.length
    });
    
  } catch (err) {
    console.error('Error fetching nearby vets:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch nearby veterinary services',
      error: err.message 
    });
  }
};
// Create
exports.createVeterinarianProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const {
      name,
      email,
      degree,
      yearsOfExperience,
      age,
      dob,
      specialization,
      clinicName,
      clinicAddress,
      phone,
      licenseNumber,
      bio,
      availability,
      consultationFee,
    } = req.body

    // Validate DOB
    const dobDate = new Date(dob)
    if (isNaN(dobDate) || dobDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth",
      })
    }


    const existingVet = await Veterinarian.findOne({ email })
    if (existingVet) {
      return res.status(409).json({
        success: false,
        message: "Veterinarian profile with this email already exists",
      })
    }

    const vetData = {
      name,
      email,
      degree,
      yearsOfExperience: Number(yearsOfExperience),
      age: Number(age),
      dob: dobDate,
      licenseNumber,
      specialization: specialization || [],
      clinicName: clinicName || "",
      clinicAddress: clinicAddress || "",
      phone: phone || "",
      bio: bio || "",
      availability: availability || { days: [], hours: { start: "", end: "" } },
      consultationFee: Number(consultationFee) || 0,
    }

    // Add profile image if uploaded
    if (req.file) {
      vetData.profileImage = {
        url: req.file.path,
        publicId: req.file.filename,
      }
    }

    const veterinarian = await Veterinarian.create(vetData)

    res.status(201).json({
      success: true,
      message: "Veterinarian profile created successfully",
      data: veterinarian,
    })
  } catch (error) {
    console.error("Create veterinarian profile error:", error)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
      })
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create veterinarian profile",
    })
  }
}

//Get all veterinarians  (NO AUTH REQUIRED)
exports.getAllVeterinarians = async (req, res) => {
  try {
    const {
      specialization,
      location,
      isVerified,
      status = "active",
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query


    const filter = { status }
    if (specialization) {
      filter.specialization = { $in: [specialization] }
    }
    if (location) {
      filter.clinicAddress = { $regex: location, $options: "i" }
    }
    if (isVerified !== undefined) {
      filter.isVerified = isVerified === "true"
    }

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1


    const veterinarians = await Veterinarian.find(filter)
      .select("-licenseNumber") //hide necessary detail before login view
      .sort(sortOptions)
      .skip(skip)
      .limit(Number.parseInt(limit))

    // Get total count for pagination
    const totalCount = await Veterinarian.countDocuments(filter)

    res.status(200).json({
      success: true,
      message: "Veterinarians fetched successfully",
      data: veterinarians,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
        totalCount,
        hasNext: skip + veterinarians.length < totalCount,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Get all veterinarians error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch veterinarians",
    })
  }
}

// PUBLIC: Get veterinarian by ID
exports.getVeterinarianById = async (req, res) => {
  try {
    const veterinarian = await Veterinarian.findById(req.params.id).select("-licenseNumber") // Hide sensitive info

    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: "Veterinarian not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Veterinarian fetched successfully",
      data: veterinarian,
    })
  } catch (error) {
    console.error("Get veterinarian by ID error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch veterinarian",
    })
  }
}

//  Get veterinarians by specialization
exports.getVeterinariansBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params
    const { page = 1, limit = 10 } = req.query

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const veterinarians = await Veterinarian.find({
      specialization: { $in: [specialization] },
      status: "active",
      isVerified: true,
    })
      .populate("user", "name email")
      .select("-licenseNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const totalCount = await Veterinarian.countDocuments({
      specialization: { $in: [specialization] },
      status: "active",
      isVerified: true,
    })

    res.status(200).json({
      success: true,
      message: `Veterinarians specializing in ${specialization} fetched successfully`,
      data: veterinarians,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
        totalCount,
        hasNext: skip + veterinarians.length < totalCount,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Get veterinarians by specialization error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch veterinarians by specialization",
    })
  }
}

// search vet
exports.searchVeterinariansByLocation = async (req, res) => {
  try {
    const { location, page = 1, limit = 10 } = req.query

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location parameter is required",
      })
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const veterinarians = await Veterinarian.find({
      clinicAddress: { $regex: location, $options: "i" },
      status: "active",
    })
      .populate("user", "name email")
      .select("-licenseNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const totalCount = await Veterinarian.countDocuments({
      clinicAddress: { $regex: location, $options: "i" },
      status: "active",
    })

    res.status(200).json({
      success: true,
      message: `Veterinarians in ${location} fetched successfully`,
      data: veterinarians,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
        totalCount,
        hasNext: skip + veterinarians.length < totalCount,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Search veterinarians by location error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to search veterinarians by location",
    })
  }
}

// Get current veterinarian's own profile
exports.getMyVeterinarianProfile = async (req, res) => {
  try {
    const userEmail = req.userData.email

    const veterinarian = await Veterinarian.findOne({ email: userEmail })

    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: "Veterinarian profile not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Your veterinarian profile fetched successfully",
      data: veterinarian,
    })
  } catch (error) {
    console.error("Get my veterinarian profile error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch veterinarian profile",
    })
  }
}

// Update veterinarian profile
exports.updateVeterinarianProfile = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const userEmail = req.userData.email
    const veterinarian = await Veterinarian.findOne({ email: userEmail })

    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: "Veterinarian profile not found",
      })
    }

    // Fields that can be updated
    const allowedUpdates = [
      "name",
      "email",
      "degree",
      "yearsOfExperience",
      "age",
      "dob",
      "specialization",
      "clinicName",
      "clinicAddress",
      "phone",
      "bio",
      "availability",
      "consultationFee",
    ]

    const updates = {}
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "yearsOfExperience" || field === "age" || field === "consultationFee") {
          updates[field] = Number(req.body[field])
        } else if (field === "dob") {
          const dobDate = new Date(req.body[field])
          if (isNaN(dobDate) || dobDate > new Date()) {
            return res.status(400).json({
              success: false,
              message: "Invalid date of birth",
            })
          }
          updates[field] = dobDate
        } else {
          updates[field] = req.body[field]
        }
      }
    })

    // Handle profile image update
    if (req.file) {
      // Delete old image if exists
      if (veterinarian.profileImage && veterinarian.profileImage.publicId) {
        try {
          await deleteFromCloudinary(veterinarian.profileImage.publicId)
        } catch (error) {
          console.log("Warning: Could not delete old profile image:", error.message)
        }
      }

      updates.profileImage = {
        url: req.file.path,
        publicId: req.file.filename,
      }
    }

    const updatedVeterinarian = await Veterinarian.findByIdAndUpdate(veterinarian._id, updates, {
      new: true,
      runValidators: true,
    }).populate("user", "name email")

    res.status(200).json({
      success: true,
      message: "Veterinarian profile updated successfully",
      data: updatedVeterinarian,
    })
  } catch (error) {
    console.error("Update veterinarian profile error:", error)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
      })
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update veterinarian profile",
    })
  }
}

//  Delete veterinarian profile
exports.deleteVeterinarianProfile = async (req, res) => {
  try {
    const userEmail = req.userData.email
    const veterinarian = await Veterinarian.findOne({ email: userEmail })

    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: "Veterinarian profile not found",
      })
    }

    // Delete profile image if exists
    if (veterinarian.profileImage && veterinarian.profileImage.publicId) {
      try {
        await deleteFromCloudinary(veterinarian.profileImage.publicId)
      } catch (error) {
        console.log("Warning: Could not delete profile image:", error.message)
      }
    }

    await Veterinarian.findByIdAndDelete(veterinarian._id)

    res.status(200).json({
      success: true,
      message: "Veterinarian profile deleted successfully",
    })
  } catch (error) {
    console.error("Delete veterinarian profile error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete veterinarian profile",
    })
  }
}




// Update veterinarian status
exports.updateVeterinarianStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, isVerified } = req.body

    const updates = {}
    if (status) updates.status = status
    if (isVerified !== undefined) updates.isVerified = isVerified

    const veterinarian = await Veterinarian.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("user", "name email")

    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: "Veterinarian not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Veterinarian status updated successfully",
      data: veterinarian,
    })
  } catch (error) {
    console.error("Update veterinarian status error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update veterinarian status",
    })
  }
}
