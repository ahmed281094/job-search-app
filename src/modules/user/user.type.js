import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLBoolean } from "graphql";

export const userType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        mobileNumber: { type: GraphQLString },
        role: { type: GraphQLString },
        bannedAt: { type: GraphQLString }
    })
})
