const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
  type: String,
  default: null
},

designation: {
  type: String,
  default: null
},
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        "ADMIN",
        "SUB_ADMIN",
        "HEAD_HR",
        "HEAD_HR_PUBLISHING",
        "HEAD_HR_NON_PUBLISHING",
        "GROUP_MANAGER",
        "SUB_GROUP_MANAGER",
        "MANAGER",
        "STUDENT"
      ],
      required: true,
    },
    roleType: {
      type: String,
      validate: {
        validator: function(v) {
          if (v === null || v === undefined || v === '') return true;
          return ["PUBLISHING", "NON_PUBLISHING"].includes(v);
        },
        message: '{VALUE} is not a valid roleType'
      },
      default: null
    },
    permissions: {
      type: [String],
      default: []
    },
    contactDetails: {
      type: String,
      default: null
    },
    managedGroups: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
      default: []
    },
    parentUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    hierarchyLevel: {
      type: Number,
      default: 6
    },

    is_active: {
      type: Boolean,
      default: true,
    },
    deleted_at: {
      type: Date,
      default: null, // soft-delete
    },
    performance: {
      marks: {
        type: Number,
        default: null
      },
      is_visible_to_student: {
        type: Boolean,
        default: false
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      updatedAt: {
        type: Date
      },
      internshipPerformance: {
        type: mongoose.Schema.Types.Mixed
      }
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

// Soft-delete middleware
UserSchema.pre(/^find/, function () {
  if (!this.getOptions().includeDeleted) {
    this.where({ deleted_at: null });
  }
});

UserSchema.index({ role: 1 });
UserSchema.index({ is_active: 1 });

module.exports =
mongoose.model("User", UserSchema);
//  UserSchema;
