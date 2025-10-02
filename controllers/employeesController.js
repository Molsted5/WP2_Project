const { ObjectId } = require('mongodb');

const getAllEmployees = async (req, res) => {
    const db = req.db;
    const employees = await db.collection('employees').find().toArray();
    if (!employees.length) return res.status(204).json({ message: 'No employees found.' });
    res.json(employees);
};

const createNewEmployee = async (req, res) => {
    const { firstname, lastname } = req.body;
    if (!firstname || !lastname) {
        return res.status(400).json({ message: 'First and last names are required.' });
    }

    try {
        const db = req.db;
        const result = await db.collection('employees').insertOne({ firstname, lastname });
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating employee.' });
    }
};

const updateEmployee = async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid ID format.' }); }

    const { firstname, lastname } = req.body;
    const updateFields = {};

    if (firstname) updateFields.firstname = firstname;
    if (lastname) updateFields.lastname = lastname;

    const db = req.db;
    const result = await db.collection('employees').findOneAndUpdate(
        { _id: ObjectId.createFromHexString(id) },
        { $set: updateFields },
        { returnDocument: 'after' }
    );

    if (!result.value) {
        return res.status(204).json({ message: `No employee matches ID ${id}.` });
    }

    res.json(result.value);
};

const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid ID format.' }); }

    const db = req.db;
    const result = await db.collection('employees').deleteOne({ _id: ObjectId.createFromHexString(id) });

    if (result.deletedCount === 0) {
        return res.status(204).json({ message: `No employee matches ID ${id}.` });
    }

    res.json({ message: 'Employee deleted successfully.' });
};

const getEmployee = async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid ID format.' }); }

    const db = req.db;
    const employee = await db.collection('employees').findOne({ _id: ObjectId.createFromHexString(id) });

    if (!employee) {
        return res.status(204).json({ message: `No employee matches ID ${id}.` });
    }

    res.json(employee);
};

module.exports = {
    getAllEmployees,
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee
};