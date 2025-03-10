
import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLBoolean } from "graphql";

export const companyType = new GraphQLObjectType({
    name: "Company",
    fields: () => ({
        id: { type: GraphQLID },
        companyName: { type: GraphQLString },
        companyEmail: { type: GraphQLString },
        address: { type: GraphQLString },
        industry: { type: GraphQLString },
        numberOfEmployees: { type: GraphQLString },
        createdBy: { type: GraphQLID },
        approvedByAdmin: { type: GraphQLBoolean },
        bannedAt: { type: GraphQLString }
    })
})
