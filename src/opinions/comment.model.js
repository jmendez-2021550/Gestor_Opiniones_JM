import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateShortUUID } from '../../helpers/uuid-generator.js';

export const Comment = sequelize.define(
  'Comment',
  {
    Id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      field: 'id',
      defaultValue: () => `cmt_${generateShortUUID()}`,
    },
    OpinionId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'opinion_id',
    },
    UserId: {
      type: DataTypes.STRING(16),
      allowNull: true,
      field: 'user_id',
    },
    CommenterName: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'commenter_name',
    },
    Content: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'content',
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
    tableName: 'comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Comment;
