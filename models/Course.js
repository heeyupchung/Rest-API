'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Course extends Model {}
    Course.init({
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'A title is required' },
                notEmpty: { msg: 'Please provide a title' }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: { msg: 'A description is required' },
                notEmpty: { msg: 'Please provide a description' }
            }
        },
        estimatedTime: {
            type: DataTypes.TEXT,
        },
        materialsNeeded: {
            type: DataTypes.TEXT,
        },
    }, { sequelize });

    Course.associate = (models) => {
        Course.belongsTo(models.User, {
            as: 'user',
            foreignKey: {
                fieldName: 'userId',
                allowNull: false
            }
        });
    };

    return Course;
};