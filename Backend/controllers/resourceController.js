const { Op } = require('sequelize');
const { Resource, Faculty } = require('../models/admin/adminmodels');

const ALLOWED_RESOURCE_TYPES = ['Journal', 'E-Book', 'Research Paper', 'Video Lecture', 'Other'];

const mapResource = (resource) => {
    const plain = resource.get ? resource.get({ plain: true }) : resource;
    const uploader = plain.uploader || plain.Faculty || null;

    return {
        id: plain.digitalResourceId,
        digital_resource_id: plain.digitalResourceId,
        title: plain.title,
        description: plain.description,
        type: plain.resourceType,
        resource_type: plain.resourceType,
        file_url: plain.fileUrl,
        fileUrl: plain.fileUrl,
        file_path: plain.filePath,
        filePath: plain.filePath,
        uploaded_by_faculty_id: plain.uploadedByFacultyId,
        uploadedByFacultyId: plain.uploadedByFacultyId,
        uploaded_by: uploader ? {
            id: uploader.id,
            facultyId: uploader.employeeId,
            name: uploader.name,
            department: uploader.departmentFull || uploader.department
        } : null,
        author: uploader ? uploader.name : '',
        approval_status: plain.approvalStatus,
        approvalStatus: plain.approvalStatus,
        approved_by_admin_id: plain.approvedByAdminId,
        created_at: plain.createdAt,
        updated_at: plain.updatedAt
    };
};

const buildPublicWhere = ({ type, q }) => {
    const where = { approvalStatus: 'Approved' };

    if (type && type !== 'All') where.resourceType = type;
    if (q) {
        where[Op.or] = [
            { title: { [Op.like]: `%${q}%` } },
            { resourceType: { [Op.like]: `%${q}%` } }
        ];
    }

    return where;
};

exports.ALLOWED_RESOURCE_TYPES = ALLOWED_RESOURCE_TYPES;
exports.mapResource = mapResource;

exports.listApprovedResources = async (req, res) => {
    try {
        const resources = await Resource.findAll({
            where: buildPublicWhere(req.query),
            include: [{ model: Faculty, as: 'uploader', attributes: ['id', 'employeeId', 'name', 'department', 'departmentFull'] }],
            order: [['created_at', 'DESC']]
        });

        return res.json(resources.map(mapResource));
    } catch (error) {
        console.error('Get approved resources error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch digital resources' });
    }
};

exports.listFacultySubmissions = async (req, res) => {
    try {
        const { uploadedBy, type, q } = req.query;
        const faculty = await Faculty.findOne({ where: { employeeId: uploadedBy } });
        if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

        const where = { uploadedByFacultyId: faculty.id };
        if (type && type !== 'All') where.resourceType = type;
        if (q) where.title = { [Op.like]: `%${q}%` };

        const resources = await Resource.findAll({
            where,
            include: [{ model: Faculty, as: 'uploader', attributes: ['id', 'employeeId', 'name', 'department', 'departmentFull'] }],
            order: [['created_at', 'DESC']]
        });

        return res.json(resources.map(mapResource));
    } catch (error) {
        console.error('Get faculty resources error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch faculty submissions' });
    }
};

exports.createFacultyResource = async (req, res) => {
    try {
        const { title, description, resource_type, file_url, file_path, uploadedByFacultyEmployeeId } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }
        if (!uploadedByFacultyEmployeeId) {
            return res.status(400).json({ success: false, message: 'Faculty ID is required' });
        }
        if (resource_type && !ALLOWED_RESOURCE_TYPES.includes(resource_type)) {
            return res.status(400).json({ success: false, message: 'Invalid resource type' });
        }
        if (file_url) {
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
            if (!urlRegex.test(file_url)) {
                return res.status(400).json({ success: false, message: 'Invalid URL format' });
            }
        }
        if (!file_url && !file_path) {
            return res.status(400).json({ success: false, message: 'File URL or file path is required' });
        }

        const faculty = await Faculty.findOne({ where: { employeeId: uploadedByFacultyEmployeeId } });
        if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

        const resource = await Resource.create({
            title: title.trim(),
            description: description || '',
            resourceType: resource_type || 'Research Paper',
            fileUrl: file_url || null,
            filePath: file_path || null,
            uploadedByFacultyId: faculty.id,
            approvalStatus: 'Pending',
            approvedByAdminId: null
        });

        return res.status(201).json({
            success: true,
            message: 'Resource submitted for admin approval',
            resource: mapResource({ ...resource.get({ plain: true }), uploader: faculty })
        });
    } catch (error) {
        console.error('Add resource error:', error);
        return res.status(500).json({ success: false, message: 'Failed to submit digital resource' });
    }
};
