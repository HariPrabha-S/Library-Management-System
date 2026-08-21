const { Op } = require('sequelize');
const { Resource, Faculty, Admin } = require('../../models/admin/adminmodels');
const { mapResource, ALLOWED_RESOURCE_TYPES } = require('../resourceController');

const getResource = async (id) => Resource.findByPk(id, {
    include: [
        { model: Faculty, as: 'uploader', attributes: ['id', 'employeeId', 'name', 'department', 'departmentFull'] },
        { model: Admin, as: 'approver', attributes: ['id', 'username', 'fullName'] }
    ]
});

exports.listResources = async (req, res) => {
    try {
        const { status = 'Pending', type, q } = req.query;
        const where = {};

        if (status && status !== 'All') where.approvalStatus = status;
        if (type && type !== 'All') where.resourceType = type;
        if (q) {
            where[Op.or] = [
                { title: { [Op.like]: `%${q}%` } },
                { resourceType: { [Op.like]: `%${q}%` } }
            ];
        }

        const resources = await Resource.findAll({
            where,
            include: [
                { model: Faculty, as: 'uploader', attributes: ['id', 'employeeId', 'name', 'department', 'departmentFull'] },
                { model: Admin, as: 'approver', attributes: ['id', 'username', 'fullName'] }
            ],
            order: [['created_at', 'DESC']]
        });

        return res.json(resources.map(mapResource));
    } catch (error) {
        console.error('Admin list resources error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch digital resources' });
    }
};

exports.getResourceDetails = async (req, res) => {
    try {
        const resource = await getResource(req.params.id);
        if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
        return res.json(mapResource(resource));
    } catch (error) {
        console.error('Admin get resource error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch resource details' });
    }
};

exports.createResource = async (req, res) => {
    try {
        const { title, description, resource_type, file_url, file_path, uploaded_by_faculty_id } = req.body;

        if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Title is required' });
        if (resource_type && !ALLOWED_RESOURCE_TYPES.includes(resource_type)) {
            return res.status(400).json({ success: false, message: 'Invalid resource type' });
        }

        const resource = await Resource.create({
            title: title.trim(),
            description: description || '',
            resourceType: resource_type || 'Research Paper',
            fileUrl: file_url || null,
            filePath: file_path || null,
            uploadedByFacultyId: uploaded_by_faculty_id || null,
            approvalStatus: 'Pending'
        });

        return res.status(201).json({ success: true, resource: mapResource(resource) });
    } catch (error) {
        console.error('Admin create resource error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create digital resource' });
    }
};

exports.updateResource = async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id);
        if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

        const { title, description, resource_type, file_url, file_path } = req.body;
        if (resource_type && !ALLOWED_RESOURCE_TYPES.includes(resource_type)) {
            return res.status(400).json({ success: false, message: 'Invalid resource type' });
        }

        if (title !== undefined) resource.title = title;
        if (description !== undefined) resource.description = description;
        if (resource_type !== undefined) resource.resourceType = resource_type;
        if (file_url !== undefined) resource.fileUrl = file_url;
        if (file_path !== undefined) resource.filePath = file_path;

        await resource.save();
        return res.json({ success: true, resource: mapResource(resource) });
    } catch (error) {
        console.error('Admin update resource error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update digital resource' });
    }
};

exports.approveResource = async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id);
        if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

        resource.approvalStatus = 'Approved';
        resource.approvedByAdminId = req.body.adminId || req.user?.id || null;
        await resource.save();

        return res.json({ success: true, message: 'Resource approved', resource: mapResource(resource) });
    } catch (error) {
        console.error('Approve resource error:', error);
        return res.status(500).json({ success: false, message: 'Failed to approve resource' });
    }
};

exports.rejectResource = async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id);
        if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

        resource.approvalStatus = 'Rejected';
        resource.approvedByAdminId = req.body.adminId || req.user?.id || null;
        await resource.save();

        return res.json({ success: true, message: 'Resource rejected', resource: mapResource(resource) });
    } catch (error) {
        console.error('Reject resource error:', error);
        return res.status(500).json({ success: false, message: 'Failed to reject resource' });
    }
};

exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id);
        if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

        await resource.destroy();
        return res.json({ success: true, message: 'Resource deleted' });
    } catch (error) {
        console.error('Delete resource error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete resource' });
    }
};
