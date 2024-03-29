import { Request, Response } from "express";
import { Op } from "sequelize";

import { sequelize } from "../database";

// Resources validations are made with validateResources middleware and validations schemas
// server/middlewares/validateResources.ts
// server/validation/ring.ts

// Create Ring
export const create = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      rid,
      name,
      description,
      schemaVersion,
      dataSource,
      ontology,
      visibility,
      version,
    } = req.body;

    const ring = await sequelize.models.Ring.create({
      userId,
      rid,
      name,
      description,
      schemaVersion,
      dataSource,
      ontology,
      visibility,
      version,
    });

    return res.send_ok("Ring created succesfully!", { ring });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Find all Rings
export const findAll = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const { role, id: userId } = req.user;
    let where = {};
    if (role !== "admin") {
      where = {
        [Op.or]: [
          { visibility: "public" },
          { userId },
        ],
      };
    }

    const rings = await sequelize.models.Ring.findAll({
      where,
      order: [["id", "DESC"]],
    });

    return res.send_ok("", { rings });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Find Ring by ringId
export const findById = async (req: Request, res: Response) => {
  try {
    const { ringId } = req.params;
    const ring = await sequelize.models.Ring.findOne({
      where: { rid: ringId },
    });
    if (!ring) {
      return res.send_notFound("Ring not found!");
    }

    return res.send_ok("", { ring });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

export const versions = async (req: Request, res: Response) => {
  try {
    const { rid } = req.params;
    const versions = await sequelize.models.Ring.getVersions({
      where: { rid },
      order: [["versionTimestamp", "DESC"]],
    });
    if (!versions) {
      return res.send_notFound("Versions not found!");
    }

    return res.send_ok("", { versions });
  } catch (error) {
    console.log(error);
    return res.send_internalServerError("An error occured, please try again!");
  }
}

// Find Ring by ringId
export const version = async (req: Request, res: Response) => {
  try {
    const { rid, version } = req.params;
    const versions = await sequelize.models.Ring.getVersions({
      where: { rid: rid, version },
      order: [["versionTimestamp", "DESC"]],
    });

    if (versions.length === 0) {
      return res.send_notFound("Ring version not found!");
    }
    const ring = Object.fromEntries(
      Object.entries(versions[0].dataValues).filter(
        ([key]) =>
          !["versionType", "versionTimestamp", "versionId"].includes(key)
      )
    );

    return res.send_ok("", { ring });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Update a Ring
export const update = async (req: Request, res: Response) => {
  try {
    const { ringId } = req.params;

    const ring = await sequelize.models.Ring.findOne({
      where: { id: ringId },
    });

    // Inject req for saveLog
    sequelize.models.Ring.beforeUpdate((model) => {
      model.req = req;
    });

    let version;
    
    if (req.body.version === ring.dataValues.version) {
      version = ring.dataValues.version + 1;
    } else {
      version = req.body.version;
    }

    const updated = await ring.update(
      { ...req.body, version },
      {
        individualHooks: true,
        returning: true,
      }
    );

    if (!updated) {
      return res.send_notModified("Ring has not been updated!");
    }

    return res.send_ok("Ring has been updated!", { ring });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Delete a Ring
export const deleteRing = async (req: Request, res: Response) => {
  try {
    const { ringId } = req.params;
    const result = await sequelize.models.Ring.destroy({
      where: { id: ringId },
    });
    if (result) {
      return res.send_ok("Ring has been deleted successfully!");
    }
    return res.send_internalServerError("Failed to delete ring!");
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("Failed to delete ring!");
  }
};
