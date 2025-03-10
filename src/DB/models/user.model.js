
import mongoose from "mongoose";
import { Decrypt, Encrypt, Hash } from "../../utilits/encryption/index.js";

export const genderTypes = {
    male: 'male',
    female: 'female'
}
export const roleTypes = {
    admin: 'admin',
    user: 'user'
}
export const providerTypes = {
    system: 'system',
    google: 'google'
}
export const OTPtypes = {
    confirmEmail: 'confirmEmail',
    forgetPassword: 'forgetPassword'
}

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowecase: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    password: {
        type: String,
        minlength: 8,
        trim: true
    },
    provider: {
        type: String,
        enum: Object.values(providerTypes),
        default: providerTypes.system
    },
    gender: {
        type: String,
        enum: Object.values(genderTypes),

    },
    DOB: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                const ageDiff = new Date().getFullYear() - value.getFullYear()
                return ageDiff > 18
            },
            message: "age must be greater than 18 years"
        }
    },
    mobileNumber: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: Object.values(roleTypes),
        required: true,
        default: roleTypes.user
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean
    },
    deletedAt: { type: Date },
    bannedAt: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changeCredentialTime: Date,
    profilePic: {
        secure_url: String,
        public_id: String
    },
    coverPic: {
        secure_url: String,
        public_id: String
    },
    OTP: [
        {
            code: { type: String },
            type: { type: String, enum: Object.values(OTPtypes) },
            expiresIn: { type: Date }
        }
    ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }

)

userSchema.virtual("username").get(function () {
    return `${this.firstName} ${this.lastName}`
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await Hash({ key: this.password, SALT_ROUNDS: process.env.SALT_ROUNDS })
    if (!this.isModified("mobileNumber")) return next();
    this.mobileNumber = await Encrypt({ key: this.mobileNumber, SECERET_KEY: process.env.SECRET_KEY })
    next()
})


userSchema.post("init",async function (doc) {
    doc.mobileNumber =await Decrypt({ key: doc.mobileNumber,SECERET_KEY :process.env.SECERET_KEY})
})

userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    const userId = this._id;
    await applicationModel.deleteMany({ userId })
    await chatModel.deleteMany({ 
        $or: [{ senderId: userId }, { receiverId: userId }] 
    })
    next()
})

const userModel = mongoose.model('User', userSchema)

export default userModel