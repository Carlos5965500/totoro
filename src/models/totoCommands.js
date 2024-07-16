const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoCommands = tDB.sequelize.define(
  "totoCommands",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    command: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 255],
      },
    },
    isPending: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isReviewed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isRejected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    pendingAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    blockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "totoCommands",
    timestamps: false,
    hooks: {
      beforeCreate: (command, options) => {
        if (command.isPending) {
          command.pendingAt = new Date();
        }
        if (command.isBlocked) {
          command.blockedAt = new Date();
        }
        if (command.isReviewed) {
          command.reviewedAt = new Date();
        }
        if (command.isApproved) {
          command.approvedAt = new Date();
        }
        if (command.isRejected) {
          command.rejectedAt = new Date();
        }
        if (command.isDeleted) {
          command.deletedAt = new Date();
        }
      },
    },
  }
);

totoroLog.info(
  "./logs/models/totoCommands.log",
  `[MODELS] Modelo ${totoCommands.name} creado.`
);

module.exports = totoCommands;
