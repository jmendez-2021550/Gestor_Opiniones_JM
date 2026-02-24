import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateShortUUID } from '../../helpers/uuid-generator.js';
import User from '../users/user.model.js';
import Comment from './comment.model.js';
import Like from './like.model.js';
import Category from './category.model.js';
import Favorite from './favorite.model.js';

export const Opinion = sequelize.define(
  'Opinion',
  {
    Id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      field: 'id',
      defaultValue: () => `opn_${generateShortUUID()}`,
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
    CategoryId: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'category_id',
      references: {
        model: Category,
        key: 'id',
      },
    },
    CreatorName: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'creator_name',
    },
    Title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'title',
    },
    Content: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'content',
    },
    Rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'rating',
      validate: {
        min: 1,
        max: 5,
      },
    },
    Public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'public',
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
    tableName: 'opinions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Opinion.belongsTo(User, { foreignKey: 'user_id', as: 'Author' });
User.hasMany(Opinion, { foreignKey: 'user_id', as: 'Opinions' });

// Category associations
Opinion.belongsTo(Category, { foreignKey: 'category_id', as: 'Category' });
Category.hasMany(Opinion, { foreignKey: 'category_id', as: 'Opinions' });

// Comments associations
Opinion.hasMany(Comment, { foreignKey: 'opinion_id', as: 'Comments' });
Comment.belongsTo(Opinion, { foreignKey: 'opinion_id', as: 'Opinion' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'Author' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'Comments' });

// Likes associations
Opinion.hasMany(Like, { foreignKey: 'opinion_id', as: 'Likes' });
Like.belongsTo(Opinion, { foreignKey: 'opinion_id', as: 'Opinion' });

// Favorites associations
Opinion.hasMany(Favorite, { foreignKey: 'opinion_id', as: 'Favorites' });
Favorite.belongsTo(Opinion, { foreignKey: 'opinion_id', as: 'Opinion' });

export default Opinion;
