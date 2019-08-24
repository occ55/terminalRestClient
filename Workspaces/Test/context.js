module.exports = async function(parent) {
	Object.assign(parent, {
		t1: 1,
		override: 1,
	});
};