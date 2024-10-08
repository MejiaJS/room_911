import axios_instance from "./axios.js";
import { useToast } from "vue-toastification";
import "vue-toastification/dist/index.css"; // Importar los estilos de Toastification
const toast = useToast();
import { Departments } from "./departaments_json.js";
export const setDataUpdate = function (employee) {
    this.updateEmployeeForm.id = employee.id;
    this.updateEmployeeForm.has_access = employee.has_access ? true : false;
    this.updateEmployeeForm.name = employee.name;
    this.updateEmployeeForm.last_name = employee.last_name;
    this.updateEmployeeForm.department = Departments[employee.department];
};
export const validateFormAdmin = function () {
    this.formAdmin.errors = {};

    if (!this.formAdmin.name) {
        this.formAdmin.errors.name = "El nombre es requerido.";
    }
    if (!this.formAdmin.email) {
        this.formAdmin.errors.email = "El correo electrónico es requerido.";
    } else if (!this.validateEmail(this.formAdmin.email)) {
        this.formAdmin.errors.email = "El correo electrónico no es válido.";
    }
    if (!this.formAdmin.password || this.formAdmin.password.length < 6) {
        this.formAdmin.errors.password =
            "La contraseña debe tener al menos 6 caracteres.";
    }

    return Object.keys(this.formAdmin.errors).length === 0;
};

export const validateEmail = function (email) {
    const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(email);
};

export const submitFormToAddAdmin = async function () {
    if (!this.validateFormAdmin()) {
        return;
    }
    this.formAdmin.isLoading = true;
    try {
        const response = await axios_instance.post(
            "/create-admin",
            this.formAdmin
        );
        if (response.status === 201) {
            toast.success(response.data.message, {
                timeout: 3000,
                position: "top-right",
            });
            this.resetForm(true);
            await this.getUsers();
        }
    } catch (error) {
        console.log(error);
        if (error.response && error.response.data.errors) {
            this.formAdmin.errors = error.response.data.errors;
        } else {
            toast.error("The admin already exists", {
                timeout: 3000,
                position: "top-right",
            });
        }
    } finally {
        this.formAdmin.isLoading = false;
    }
};

export const submitFormToAddEmployee = async function () {
    if (!this.validateFormEmployee()) {
        return;
    }
    this.formEmployee.isLoading = true;
    try {
        const response = await axios_instance.post(
            "/create-employee",
            this.formEmployee
        );
        if (response.status === 201) {
            toast.success(response.data.message, {
                timeout: 3000,
                position: "top-right",
            });
            await this.getEmployees();
            this.resetForm(false);
        }
    } catch (error) {
        if (error.response && error.response.data.errors) {
            this.formEmployee.errors = error.response.data.errors;
            toast.error(
                "Ocurrio un error al registrar el empleado: " +
                    error.response.data.message
            );
        }
    } finally {
        this.formEmployee.isLoading = false;
    }
};
export const validateFormEmployee = async function () {
    this.formEmployee.errors = {};

    if (!this.formEmployee.name) {
        this.formEmployee.errors.name = "El nombre es requerido.";
    }
    if (!this.formEmployee.lastname) {
        this.formEmployee.errors.lastname = "El apellido es requerido.";
    }
    if (!this.formEmployee.department) {
        this.formEmployee.errors.department = "El departamento es requerido.";
    }

    return Object.keys(this.formEmployee.errors).length === 0;
};
export const resetForm = function (isAdmin) {
    if (isAdmin) {
        this.formAdmin.name = "";
        this.formAdmin.email = "";
        this.formAdmin.password = "";
        this.formAdmin.errors = {};
    } else {
        this.formEmployee.name = "";
        this.formEmployee.lastname = "";
        this.formEmployee.department = "";
        this.formEmployee.errors = {};
    }
};
export const applyFilters = function () {
    const searchObject = {
        employee_id: this.filters.employee_id.toLowerCase().trim(),
        name: this.filters.name.toLowerCase().trim(),
        last_name: this.filters.last_name.toLowerCase().trim(),
        department: this.filters.department,
    };

    // Verifica si hay algún filtro aplicado
    const isFiltering =
        this.filters.employee_id ||
        this.filters.name ||
        this.filters.last_name ||
        this.filters.department;

    if (isFiltering) {
        // Usa `this.originalEmployeeList` para filtrar
        let filteredEmployees = this.originalEmployeeList.filter((employee) => {
            // Filtro por ID de empleado (si está presente)
            if (searchObject.employee_id) {
                if (
                    !employee.employee_id
                        .toLowerCase()
                        .includes(searchObject.employee_id)
                ) {
                    return false;
                }
            }

            // Filtro por nombre (si está presente)
            if (searchObject.name) {
                if (!employee.name.toLowerCase().includes(searchObject.name)) {
                    return false;
                }
            }

            // Filtro por apellido (si está presente)
            if (searchObject.last_name) {
                if (
                    !employee.last_name
                        .toLowerCase()
                        .includes(searchObject.last_name)
                ) {
                    return false;
                }
            }

            // Filtro por departamento (si está presente)
            if (searchObject.department) {
                const department = Object.entries(Departments).find(
                    (entry) => entry[1] == searchObject.department
                )[0];
                if (
                    department &&
                    !employee.department
                        .toLowerCase()
                        .includes(department.toLowerCase())
                ) {
                    return false;
                }
            }

            // Si pasa todos los filtros, se incluye el empleado
            return true;
        });

        // Verifica si se encontraron empleados filtrados
        if (filteredEmployees.length > 0) {
            this.employees = filteredEmployees;
        } else {
            toast.info(
                "No se encontraron resultados para los filtros aplicados.",
                {
                    timeout: 3000,
                    position: "top-right",
                }
            );
        }
    } else {
        // Si no hay filtros, muestra la lista completa de empleados
        this.employees = [...this.originalEmployeeList];
    }
};

export const clearFilters = async function () {
    toast.info("Clearing filters", {
        timeout: 3000,
        position: "top-right",
    });
    this.filters.employee_id = "";
    this.filters.name = "";
    this.filters.last_name = "";
    this.filters.department = "";
    this.filters.initialAccessDate = "";
    this.filters.finalAccessDate = "";
    this.filteredEmployees = [];
    this.employees = [...this.originalEmployeeList];
};

export const deleteEmployee = async function (id) {
    try {
        toast.warning("Deleting...", {
            timeout: 3000,
            position: "top-right",
        });
        const response = await axios_instance.post(`/delete-employee/${id}`);
        if (response.status === 200) {
            toast.success(response.data.message, {
                timeout: 3000,
                position: "top-right",
            });
            await this.getEmployees(true); // Mantener filtros aplicados
        }
    } catch (error) {
        console.error(error);
    }
};

export const updateEmployee = async function () {
    try {
        toast.info("Wait a moment, It may take a few seconds", {
            timeout: 3000,
            position: "top-right",
        });
        const id = this.updateEmployeeForm.id;
        const data = {
            name: this.updateEmployeeForm.name,
            last_name: this.updateEmployeeForm.last_name,
            department: this.updateEmployeeForm.department,
            has_access: this.updateEmployeeForm.has_access,
        };
        const response = await axios_instance.post(
            `/update-employee/${id}`,
            data
        );
        if (response.status === 200) {
            toast.success("Updated successfully", {
                timeout: 3000,
                position: "top-right",
            });
            await this.getEmployees(true); // Mantener filtros aplicados
        }
    } catch (error) {
        console.error(error);
    }
};

export const uploadFile = async function (file) {
    try {
        toast.info("Wait a moment, It may take a few seconds", {
            timeout: 3000,
            position: "top-right",
        });
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios_instance.post("/upload-file", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Accept: "application/json",
            },
        });
        if (response.status === 200) {
            toast.success(response.data.message, {
                timeout: 3000,
                position: "top-right",
            });
        }
        await this.getEmployees();
    } catch (error) {
        console.error(error);
    }
};
export const getEmployees = async function (
    applyFilters = true,
    isUpdate = false
) {
    try {
        if (isUpdate) {
            toast.info("Wait a moment...", {
                timeout: 3000,
            });
        }
        const response = await axios_instance.get("/get-employees");
        if (response.status === 200) {
            this.originalEmployeeList = response.data.employees;
            this.employees = [...this.originalEmployeeList];

            // Aplicar filtros si es necesario
            if (applyFilters) {
                this.applyFilters();
            }
        }
        if (isUpdate) {
            this.clearFilters();
            toast.success("Updated successfully", {
                timeout: 3000,
                position: "top-right",
            });
        }
    } catch (error) {
        console.error(error);
    }
};

export const getDepartments = async function () {
    try {
        const response = await axios_instance.get("/get-departments");
        if (response.status === 200) {
            this.departments = response.data.departments;
        }
    } catch (error) {
        console.error(error);
    }
};

export const showTime = function () {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    const currentTime = hours + ":" + minutes + ":" + seconds + " " + ampm;
    this.currentTime = currentTime;
};
export const handleFile = async function (event) {
    const file = event.target.files[0];
    if (file) {
        await this.uploadFile(file);
        event.target.value = "";
    }
};
export const previousPage = async function () {
    if (this.currentPage > 1) {
        this.currentPage--;
    }
};
export const nextPage = async function () {
    if (this.currentPage < this.totalPages && this.totalPages > 1) {
        this.currentPage++;
    }
};
export const updateObject = async function (employees) {
    this.employees = employees;
};
export const simulateId = function (id) {
    if (id && id.length > 10) {
        window.open(`/simulate-room/${id}`, "_blank");
    }
};

export const exportHistory = async function (id) {
    try {
        toast.info("Wait a moment, It may take a few seconds", {
            timeout: 3000,
            position: "top-right",
        });
        const response = await axios_instance.post(
            "/export-data",
            { employee_id: id },
            {
                responseType: "blob", // Asegúrate de que la respuesta sea de tipo blob
            }
        );

        if (response.status === 200) {
            // Crear un enlace temporal para forzar la descarga
            const url = window.URL.createObjectURL(
                new Blob([response.data], { type: "application/pdf" })
            );
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `access_history_${id}.pdf`); // Nombre del archivo
            document.body.appendChild(link);
            link.click();

            // Remover el enlace temporal del DOM
            document.body.removeChild(link);

            toast.success("Archivo descargado exitosamente", {
                timeout: 3000,
                position: "top-right",
            });
        }
    } catch (error) {
        console.error(error);
        toast.error("Error al descargar el archivo", {
            timeout: 3000,
            position: "top-right",
        });
    }
};

export const getUsers = async function () {
    try {
        const response = await axios_instance.get("/get-users");
        if (response.status === 200) {
            this.admins = response.data.users;
        }
    } catch (error) {
        console.error(error);
    }
};

export const deleteUser = async function (id) {
    try {
        toast.warning("Deleting admin...", {
            timeout: 3000,
            position: "top-right",
        });
        const response = await axios_instance.post(`/delete-user/${id}`);
        if (response.status === 200) {
            toast.success(response.data.message, {
                timeout: 3000,
                position: "top-right",
            });
            await this.getUsers();
        }
    } catch (error) {
        if (error.response && error.response.data.error) {
            if (error.response.status >= 400) {
                toast.error(error.response.data.error, {
                    timeout: 3000,
                    position: "top-right",
                });
            }
        }
    }
};
