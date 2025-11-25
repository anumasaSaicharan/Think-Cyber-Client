

import PropTypes from 'prop-types';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
      <img 
        src={course.image} 
        alt={course.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {course.level}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <div className="flex items-center mb-4">
          <span className="text-yellow-400">★</span>
          <span className="ml-1 text-gray-600">{course.rating}</span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-gray-600">{course.duration}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {course.topics.map((topic, index) => (
            <span 
              key={index}
              className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
            >
              {topic}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">₹{course.price}</span>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    level: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    duration: PropTypes.string.isRequired,
    topics: PropTypes.arrayOf(PropTypes.string).isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
};

export default CourseCard;