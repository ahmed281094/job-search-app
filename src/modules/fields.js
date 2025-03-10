
import { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
import { userType } from "./user/user.type.js";
import { companyType } from "./copmany/company.type.js";
import userModel from "../DB/models/user.model.js";
import { companyModel } from "../DB/models/company.model.js";
import * as CR from "./copmany/company.resolve.js";
import * as UR from "./user/user.resolve.js";

const AllDataType = new GraphQLObjectType({
    name: "AllData",
    fields: () => ({
        users: { type: new GraphQLList(userType) },
        companies: { type: new GraphQLList(companyType) }
    })
});

export const Query = {
    getAllData: {
        type: AllDataType,
        args: {
            adminId: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve: async (_, { adminId }) => {
            const admin = await userModel.findById(adminId);
            if (!admin || admin.role !== "admin") {
                throw new Error("Unauthorized: Only admins can access this data");
            }
            const users = await userModel.find({});
            const companies = await companyModel.find({});
            return { users, companies };
        }
    }
}

export const Mutation = {
    toggleBanUser: {
        type: GraphQLString,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
            adminId: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve: UR.toggleBanUser
    },
    toggleBanCompany: {
        type: GraphQLString,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
            adminId: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve: CR.toggleBanCompany
    },
    approveCompany: {
        type: GraphQLString,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
            adminId: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve: CR.approveCompany
    }
}

