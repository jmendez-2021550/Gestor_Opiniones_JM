import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateShortUUID } from '../../helpers/uuid-generator.js';
import User from '../users/user.model.js';

export const Like = sequelize.define(
  'Like',
  {
    Id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      field: 'id',
      defaultValue: () => `lk_${generateShortUUID()}`,
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
      references: {
        model: User,
        key: 'id',
      },
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    tableName: 'opinion_likes',
    timestamps: false,
    createdAt: 'created_at',
  }
);

// Associations will be set up in opinion.model.js to avoid circular imports
Like.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
User.hasMany(Like, { foreignKey: 'user_id', as: 'UserLikes' });

export default Like;
