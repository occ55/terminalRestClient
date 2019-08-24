module.exports = ({ context, req, previous }) => {
	previous.b = 2;
};