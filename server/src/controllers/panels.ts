import e, { Request, Response } from "express";
import { sequelize } from "../database";
import accessControl, {
  accessControlFieldsFilter,
} from "../services/accesscontrol";
const { Op } = require("sequelize");

// Resources validations are made with validateResources middleware and validations schemas
// server/middlewares/validateResources.ts
// server/validation/panel.ts

// Create Panel
export const create = async (req: Request, res: Response) => {
  try {
    const permission = await accessControl.can(
      // @ts-ignore
      req.user.role,
      "panels:create"
    );
    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }

    const {
      title,
      collaborators = [],
      contents,
      visibility,
      parent = null,
    } = req.body;

    const panel = await sequelize.models.Panel.create({
      title,
      //@ts-ignore
      userId: req.user.id,
      collaborators,
      contents,
      visibility,
      parent,
    });

    console.log({ panel });

    return res.send_ok("Panel created succesfully!", { panel });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Find all Panels
export const findAll = async (req: Request, res: Response) => {
  //@ts-ignore
  const { role, id } = req.user;

  try {
    const where =
      role === "admin"
        ? {}
        : {
            [Op.or]: [
              { visibility: "public" },
              { collaborators: { [Op.contains]: [id] } },
              { userId: id },
            ],
          };

    const panels = await sequelize.models.Panel.findAll({
      where,
      // attributes: { exclude: [""] }, // TODO: Check if we need to hide something.
      order: [["id", "DESC"]],
    });

    return res.send_ok("", { panels });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Find Panel by panelId
export const findById = async (req: Request, res: Response) => {
  try {
    const id = req.params.panelId;
    const panel = await sequelize.models.Panel.findOne({ where: { id } });

    const permission = await accessControl.can(
      // @ts-ignore
      req.user.role,
      "panels:read",
      { user: req.user, resource: panel }
    );
    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }

    if (!panel) {
      return res.send_notFound("Panel not found!");
    }

    return res.send_ok("", {
      panel: accessControlFieldsFilter(panel.dataValues, permission.fields),
    });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

export const history = async (req: Request, res: Response) => {
  try {
    const id = req.params.panelId;
    const panel = await sequelize.models.Panel.findOne({ where: { id } });
    if (!panel) {
      return res.send_notFound("Panel not found!");
    }

    const versions = await sequelize.models.Panel.getVersions({
      where: { id },
    });
    console.log(versions);

    return res.send_ok("", { versions });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Update a Panel
export const update = async (req: Request, res: Response) => {
  try {
    const id = req.params.panelId;
    const payload = { ...req.body };

    // Inject req for saveLog
    //@ts-ignore
    sequelize.models.Panel.beforeUpdate((model) => {
      model.req = req;
    });

    const result = await sequelize.models.Panel.update(payload, {
      where: { id },
      individualHooks: true,
    });

    if (!result.length) {
      return res.send_notModified("Panel has not been updated!");
    }
    const panel = await sequelize.models.Panel.findOne({ where: { id } });

    return res.send_ok("Panel has been updated!", { panel });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Delete a Panel
export const deletePanel = async (req: Request, res: Response) => {
  try {
    const id = req.params.panelId;
    const result = await sequelize.models.Panel.update(
      {
        deleted: true,
      },
      {
        where: { id },
      }
    );
    if (result) {
      return res.send_ok("Panel has been deleted successfully!");
    }
    return res.send_internalServerError("Failed to delete panel!");
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("Failed to delete panel!");
  }
};