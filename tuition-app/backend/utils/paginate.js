// Parse page/limit from query and return { page, limit, skip }
function getPagination(query, defaultLimit = 15) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.max(1, parseInt(query.limit) || defaultLimit);
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

// Slice an array and return paginated response shape
function paginateArray(arr, page, limit) {
  const total = arr.length;
  const data  = arr.slice((page - 1) * limit, page * limit);
  return { data, total, page, pages: Math.ceil(total / limit) || 1 };
}

// Build paginated response for a Mongoose query
async function paginateQuery(Model, filter, sort, page, limit) {
  const [total, data] = await Promise.all([
    Model.countDocuments(filter),
    Model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
  ]);
  return { data, total, page, pages: Math.ceil(total / limit) || 1 };
}

module.exports = { getPagination, paginateArray, paginateQuery };
