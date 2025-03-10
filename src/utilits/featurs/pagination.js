export const pagination = async ({ page = 1, model, filter = {}, populate = [], limit = 10, sort = "-createdAt" }) => {
    let _page = Math.max(1, page)
    let _limit = Math.max(1, limit)
    let skip = (_page - 1) * _limit

    const data = await model.find(filter)
        .limit(_limit)
        .skip(skip)
        .sort(sort)
        .populate(populate);

    const totalCount = await model.countDocuments(filter)

    return { data, totalCount }
}




