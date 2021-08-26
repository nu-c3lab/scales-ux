import { DataTypes } from "sequelize";

export const ringVisibilityValues = ["public", "private"];

export default (sequelize, options) => {
  const Ring = sequelize.define(
    "Ring",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      contents: DataTypes.JSON,
      sourceType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      connectionDetails: DataTypes.JSON,
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.STRING,
      visibility: {
        type: DataTypes.ENUM,
        values: ringVisibilityValues,
        defaultValue: "private",
      },
    },
    options
  );

  return Ring;
};