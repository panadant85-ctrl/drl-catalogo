"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getManagers = getManagers;
exports.getManagerById = getManagerById;
exports.getManagerByAuthUserId = getManagerByAuthUserId;
exports.createNewManager = createNewManager;
exports.updateExistingManager = updateExistingManager;
exports.removeManager = removeManager;
const managerRepository_1 = require("../../repositories/managers/managerRepository");
async function getManagers() {
    return (0, managerRepository_1.findManagers)();
}
async function getManagerById(id) {
    return (0, managerRepository_1.findManagerById)(id);
}
async function getManagerByAuthUserId(authUserId) {
    return (0, managerRepository_1.findManagerByAuthUserId)(authUserId);
}
async function createNewManager(input) {
    const existingUsername = await (0, managerRepository_1.findManagerByUsername)(input.username);
    if (existingUsername) {
        throw new Error("Ya existe un gestor con ese username.");
    }
    const existingEmail = await (0, managerRepository_1.findManagerByEmail)(input.email);
    if (existingEmail) {
        throw new Error("Ya existe un gestor con ese email.");
    }
    return (0, managerRepository_1.createManager)(input);
}
async function updateExistingManager(id, input) {
    const existing = await (0, managerRepository_1.findManagerById)(id);
    if (!existing) {
        throw new Error("Gestor no encontrado.");
    }
    if (input.username &&
        input.username !== existing.username) {
        const duplicate = await (0, managerRepository_1.findManagerByUsername)(input.username);
        if (duplicate && duplicate.id !== id) {
            throw new Error("Ya existe un gestor con ese username.");
        }
    }
    if (input.email &&
        input.email !== existing.email) {
        const duplicate = await (0, managerRepository_1.findManagerByEmail)(input.email);
        if (duplicate && duplicate.id !== id) {
            throw new Error("Ya existe un gestor con ese email.");
        }
    }
    return (0, managerRepository_1.updateManager)(id, input);
}
async function removeManager(id) {
    return (0, managerRepository_1.deleteManager)(id);
}
