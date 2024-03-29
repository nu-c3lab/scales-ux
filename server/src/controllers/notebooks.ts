import { Request, Response } from "express";
import { sequelize } from "../database";
import accessControl from "../services/accesscontrol";
import { Op } from "sequelize";
import { permisionsFieldsFilter } from "../services/accesscontrol";

// Resources validations are made with validateResources middleware and validations schemas
// server/middlewares/validateResources.ts
// server/validation/notebook.ts

// Create Notebook
export const create = async (req: Request, res: Response) => {
  try {
    const {
      title,
      collaborators = [],
      contents,
      visibility,
      parent = null,
    } = req.body;

    const notebook = await sequelize.models.Notebook.create({
      title,
      //@ts-ignore
      userId: req.user.id,
      collaborators,
      contents,
      visibility,
      parent,
    });

    return res.send_ok("Notebook created succesfully!", { notebook });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Find all Notebooks
export const findAll = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const { role, id: userId } = req.user;

    const permission = await accessControl.can(role, "notebooks:read");
    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }

    let where = {};
    if (role !== "admin") {
      where = {
        deleted: false,
        [Op.or]: [
          { visibility: "public" },
          { collaborators: { [Op.contains]: [userId] } },
          { userId },
        ],
      };
    }
    const notebooks = await sequelize.models.Notebook.findAll({
      where,
      order: [["id", "DESC"]],
    });

    return res.send_ok("", { notebooks });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Find Notebook by notebookId
export const findById = async (req: Request, res: Response) => {
  try {
    const notebookId = req.params.notebookId;
    //@ts-ignore
    const { role, id: reqUserId } = req.user;

    let where = { id: notebookId };
    if (role !== "admin") {
      // @ts-ignore
      where = { ...where, deleted: false };
    }

    const notebook = await sequelize.models.Notebook.findOne({
      where,
    });
    if (!notebook) {
      return res.send_notFound("Notebook not found!");
    }

    const { visibility, collaborators, userId } = notebook;
    if (
      role !== "admin" &&
      visibility !== "public" &&
      !collaborators.includes(reqUserId) &&
      userId !== reqUserId
    ) {
      return res.send_forbidden("Not allowed!");
    }

    return res.send_ok("", {
      notebook: notebook.dataValues,
    });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

export const history = async (req: Request, res: Response) => {
  try {
    const { notebookId } = req.params;
    //@ts-ignore
    const { role } = req.user;
    if (role !== "admin") {
      return res.send_forbidden("Not allowed!");
    }

    const notebook = await sequelize.models.Notebook.findOne({
      where: { id: notebookId },
    });
    if (!notebook) {
      return res.send_notFound("Notebook not found!");
    }

    const versions = await sequelize.models.Notebook.getVersions({
      where: { id: notebookId },
    });

    return res.send_ok("", { versions });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Update a Notebook
export const update = async (req: Request, res: Response) => {
  try {
    const { notebookId } = req.params;
    //@ts-ignore
    const { role, id: reqUserId } = req.user;

    let where = { id: notebookId };
    if (role !== "admin") {
      // @ts-ignore
      where = { ...where, deleted: false };
    }

    const notebook = await sequelize.models.Notebook.findOne({
      where,
    });
    if (!notebook) {
      return res.send_notFound("Notebook not found!");
    }

    const permission = await accessControl.can(role, "notebooks:update", {
      user: req.user,
      resource: notebook,
    });
    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }

    const payload = permisionsFieldsFilter(req.body, permission);

    if (Object.keys(payload).length === 0) {
      return res.send_notModified("Notebook has not been updated!");
    }

    const { collaborators, userId } = notebook;
    // General Case
    if (
      role !== "admin" &&
      !collaborators.includes(reqUserId) &&
      userId !== reqUserId
    ) {
      return res.send_forbidden("Not allowed!");
    }

    //  Owner Operations Case
    if (userId !== reqUserId) {
      if (
        payload.includes("userId") ||
        payload.includes("collaborators") ||
        payload.includes("visibility")
      ) {
        return res.send_forbidden("Not allowed!");
      }
    }

    // Inject req for saveLog
    //@ts-ignore
    sequelize.models.Notebook.beforeUpdate((model) => {
      model.req = req;
    });

    const result = await sequelize.models.Notebook.update(payload, {
      where: { id: notebookId },
      individualHooks: true,
    });

    if (!result.length) {
      return res.send_notModified("Notebook has not been updated!");
    }
    const updatedNotebook = await sequelize.models.Notebook.findOne({
      where: { id: notebookId },
    });

    return res.send_ok(`Notebook ${notebookId} has been updated!`, {
      ...updatedNotebook.dataValues,
    });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Delete a Notebook
export const deleteNotebook = async (req: Request, res: Response) => {
  try {
    const { notebookId } = req.params;
    //@ts-ignore
    const { role, id: userId } = req.user;
    console.log(userId);
    const result = await sequelize.models.Notebook.update(
      {
        deleted: true,
      },
      {
        where: { id: notebookId },
      }
    );
    if (result) {
      return res.send_ok("Notebook has been deleted successfully!");
    }
    return res.send_internalServerError("Failed to delete notebook!");
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("Failed to delete notebook!");
  }
};

export const panels = async (req: Request, res: Response) => {
  try {
    const { notebookId } = req.params;
    //@ts-ignore
    const { role } = req.user;
    const notebook = await sequelize.models.Notebook.findOne({
      where: { id: notebookId },
    });

    if (!notebook) {
      return res.send_notFound("Notebook not found!");
    }

    const { visibility, collaborators, userId } = notebook;
    if (
      role !== "admin" &&
      visibility !== "public" &&
      !collaborators.includes(userId) &&
      userId !== userId
    ) {
      return res.send_forbidden("Not allowed!");
    }

    const panels = await sequelize.models.Panel.findAll({
      where: { notebookId, deleted: false },
      order: [["id", "DESC"]],
    });

    return res.send_ok("", { panels });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};
