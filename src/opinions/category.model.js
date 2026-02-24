import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateShortUUID } from '../../helpers/uuid-generator.js';

export const Category = sequelize.define(
  'Category',
  {
    Id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      field: 'id',
      defaultValue: () => `cat_${generateShortUUID()}`,
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'name',
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Category;
