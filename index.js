const express = require('express');
const { resolve } = require('path');
const cors = require('cors');
const app = express();
let { sequelize } = require('./lib/index');
let { employeeDepartment } = require('./models/employeeDepartment.model');
let { employee } = require('./models/employee.model');
let { department } = require('./models/department.model');
let { role } = require('./models/role.model');
let { employeeRole } = require('./models/employeeRole.model');
const port = 3000;
app.use(cors());
app.use(express.json());

async function getEmployeeDepartments(employeeId) {
  const employeeDepartments = await employeeDepartment.findAll({
    where: { employeeId },
  });

  let departmentData;
  for (let empDep of employeeDepartments) {
    departmentData = await department.findOne({
      where: { id: empDep.departmentId },
    });
  }

  return departmentData;
}

async function getEmployeeRoles(employeeId) {
  let roles = await employeeRole.findAll({
    where: {
      employeeId: employeeId, // Ensure this field exists in your department table
    },
  });

  let roleData;
  for (let empRol of roles) {
    roleData = await role.findOne({
      where: { id: empRol.roleId },
    });
  }

  return roleData;
}

async function getEmployeeDetails(employeeData) {
  const department = await getEmployeeDepartments(employeeData.id);
  const role = await getEmployeeRoles(employeeData.id);

  return {
    ...employeeData.dataValues,
    department,
    role,
  };
}

async function getAllEmployeeDetails(employees) {
  const employeesWithDetails = [];

  for (let i = 0; i < employees.length; i++) {
    let employeeDetails = await getEmployeeDetails(employees[i]);
    employeesWithDetails.push(employeeDetails);
  }

  return employeesWithDetails;
}

app.get('/employees', async (req, res) => {
  try {
    let employees = await employee.findAll();
    let employeesDetails = await getAllEmployeeDetails(employees); // Await the result here

    if (employeesDetails.length === 0) {
      res.status(404).json({ message: 'No employees found' });
    } else {
      res.status(200).json({ employees: employeesDetails });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error Finding employees', error: error.message });
  }
});

async function findEmployeeByID(Id) {
  let emp = await employee.findOne({
    where: { Id },
  });

  return emp;
}

async function employeeDepartmentById(Id) {
  let empDepartment = await employeeDepartment.findAll({
    where: { Id },
  });

  let employeeData = [];
  for (let department of empDepartment) {
    let emp = await employee.findOne({
      where: { Id: department.employeeId },
    });

    if (emp) {
      employeeData.push(emp);
    }
  }

  return employeeData;
}

async function employeeDepartmentByRoleId(Id) {
  let empRole = await employeeRole.findAll({
    where: { Id },
  });

  let employeeData = [];
  for (let role of empRole) {
    let emp = await employee.findOne({
      where: { Id: role.employeeId },
    });

    if (emp) {
      employeeData.push(emp);
    }
  }

  return employeeData;
}

async function deleteEmployeeDepartmentById(Id) {
  await employeeDepartment.destroy({
    where: { employeeId: parseInt(Id) },
  });
}

async function createEmployeeDepartment(Id, departmentId) {
  const empDepartment = await employeeDepartment.create({
    employeeId: Id,
    departmentId,
  });
  return empDepartment;
}

async function deleteEmployeeRoleById(Id) {
  await employeeRole.destroy({
    where: { employeeId: parseInt(Id) },
  });
}

async function createEmployeeRole(Id, roleId) {
  const empRole = await employeeRole.create({
    employeeId: Id,
    roleId,
  });
  return empRole;
}

async function deleteEmployeById(Id) {
  await employee.destroy({
    id: Id,
  });
}

app.get('/employees/details/:id', async (req, res) => {
  try {
    let Id = req.params.id;
    let employee = await findEmployeeByID(Id);
    let employeesDetails = await getAllEmployeeDetails(employee); // Await the result here

    if (employeesDetails.length === 0) {
      res.status(404).json({ message: 'No employees found' });
    } else {
      res.status(200).json({ employees: employeesDetails });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error Finding employees', error: error.message });
  }
});

app.get('/employees/department/:departmentId', async (req, res) => {
  try {
    let Id = req.params.departmentId;
    let employeeData = await employeeDepartmentById(Id);
    let employeesDetails = await getAllEmployeeDetails(employeeData); // Await the result here

    if (employeesDetails.length === 0) {
      res.status(404).json({ message: 'No employees found' });
    } else {
      res.status(200).json({ employees: employeesDetails });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error Finding employees', error: error.message });
  }
});

app.get('/employees/role/:roleId', async (req, res) => {
  try {
    let Id = req.params.roleId;
    let employeeData = await employeeDepartmentByRoleId(Id);
    let employeesDetails = await getAllEmployeeDetails(employeeData); // Await the result here

    if (employeesDetails.length === 0) {
      res.status(404).json({ message: 'No employees found' });
    } else {
      res.status(200).json({ employees: employeesDetails });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error Finding employees', error: error.message });
  }
});

app.get('/employees/sort-by-name', async (req, res) => {
  try {
    const order = req.query.order === 'desc' ? 'DESC' : 'ASC';

    const employees = await employee.findAll({
      order: [['name', order]], // Sequelize order clause
    });

    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: 'No employees found' });
    }
    const employeesDetails = [];
    for (const emp of employees) {
      const employeeDetails = await getEmployeeDetails(emp);
      employeesDetails.push(employeeDetails);
    }
    res.status(200).json({ employees: employeesDetails });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching employees',
      error: error.message,
    });
  }
});

app.get('/seed_db', async (req, res) => {
  await sequelize.sync({ force: true });

  const departments = await department.bulkCreate([
    { name: 'Engineering' },
    { name: 'Marketing' },
  ]);

  const roles = await role.bulkCreate([
    { title: 'Software Engineer' },
    { title: 'Marketing Specialist' },
    { title: 'Product Manager' },
  ]);

  const employees = await employee.bulkCreate([
    { name: 'Rahul Sharma', email: 'rahul.sharma@example.com' },
    { name: 'Priya Singh', email: 'priya.singh@example.com' },
    { name: 'Ankit Verma', email: 'ankit.verma@example.com' },
  ]);

  await employeeDepartment.create({
    employeeId: employees[0].id,
    departmentId: departments[0].id,
  });
  await employeeRole.create({
    employeeId: employees[0].id,
    roleId: roles[0].id,
  });

  await employeeDepartment.create({
    employeeId: employees[1].id,
    departmentId: departments[1].id,
  });
  await employeeRole.create({
    employeeId: employees[1].id,
    roleId: roles[1].id,
  });

  await employeeDepartment.create({
    employeeId: employees[2].id,
    departmentId: departments[0].id,
  });
  await employeeRole.create({
    employeeId: employees[2].id,
    roleId: roles[2].id,
  });

  return res.json({ message: 'Database seeded!' });
});

app.post('/employees/new', async (req, res) => {
  try {
    const { name, email, departmentId, roleId } = req.body;

    if (!name || !email || !departmentId || !roleId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newEmployee = await addNewEmployee({
      name,
      email,
      departmentId,
      roleId,
    });
    res.status(201).json(newEmployee);
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Error adding employee', error: error.message });
  }
});

async function addNewEmployee({ name, email, departmentId, roleId }) {
  const departmentExists = await department.findOne({
    where: { id: departmentId },
  });
  if (!departmentExists) {
    throw new Error(`Department with ID ${departmentId} does not exist`);
  }

  const roleExists = await role.findOne({ where: { id: roleId } });
  if (!roleExists) {
    throw new Error(`Role with ID ${roleId} does not exist`);
  }

  const newEmployee = await employee.create({ name, email });

  await employeeDepartment.create({
    employeeId: newEmployee.id,
    departmentId,
  });

  await employeeRole.create({
    employeeId: newEmployee.id,
    roleId,
  });

  const employeeDetails = await employee.findOne({
    where: { id: newEmployee.id },
    include: [
      {
        model: department,
        through: { attributes: [] }, // Exclude join table attributes
      },
      {
        model: role,
        through: { attributes: [] }, // Exclude join table attributes
      },
    ],
  });
  return employeeDetails;
}

app.post('/employees/update/:id', async (req, res) => {
  const employeeId = req.params.id;
  const { name, email, departmentId, roleId } = req.body;

  try {
    let employeeData = await findEmployeeByID(employeeId);
    if (!employeeData) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    // Update employee properties if they are provided in the request body
    if (name) {
      employeeData.name = name;
    }
    if (email) {
      employeeData.email = email;
    }
    await employeeData.save();
    if (departmentId) {
      deleteEmployeeDepartmentById(employeeData.id);
      createEmployeeDepartment(employeeData.id, departmentId);
    }
    if (roleId) {
      deleteEmployeeRoleById(employeeData.id);
      createEmployeeRole(employeeData.id, roleId);
    }
    const updatedEmployee = await getEmployeeDetails(employeeData);
    res.status(200).json(updatedEmployee);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating employee', error: error.message });
  }
});

app.post('/employees', async (req, res) => {
  const { id } = req.body;

  // Validate the request body
  if (!id || typeof id !== 'number') {
    return res
      .status(400)
      .json({ message: 'Invalid or missing ID in request body.' });
  }

  try {
    deleteEmployeeDepartmentById(id);
    deleteEmployeeRoleById(id);
    deleteEmployeeRoleById(id);
    res
      .status(200)
      .json({ message: `Employee with ID ${id} has been deleted.` });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while deleting the employee.' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
