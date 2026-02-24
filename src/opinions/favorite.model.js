import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateShortUUID } from '../../helpers/uuid-generator.js';
import User from '../users/user.model.js';

export const Favorite = sequelize.define(
  'Favorite',
  {
    Id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      field: 'id',
      defaultValue: () => `fav_${generateShortUUID()}`,
    },
    OpinionId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'opinion_id',
    },
    UserId: {
      type: DataTypes.STRING(16),
      allowNull: false,
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
    tableName: 'opinion_favorites',
    timestamps: false,
    createdAt: 'created_at',
    indexes: [
      {
        unique: true,
        fields: ['opinion_id', 'user_id'],
      },
    ],
  }
);

// Associations will be set up in opinion.model.js to avoid circular imports
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'UserFavorites' });

export default Favorite;
