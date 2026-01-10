import React from 'react';

// Component renderers for each section type
const HeroSection = ({ props }) => {
  const {
    title,
    subtitle,
    ctaText,
    ctaLink,
    backgroundImage,
    alignment = 'center',
  } = props;

  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div className="absolute inset-0 bg-gray-900/75"></div>
      <div className="relative mx-auto max-w-screen-xl px-4 py-32 sm:px-6 lg:flex lg:h-screen lg:items-center lg:px-8">
        <div className={`max-w-3xl ${alignment === 'center' ? 'mx-auto text-center' : 'text-left'}`}>
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
            {title || 'Welcome'}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-2xl text-white/90 sm:text-xl/relaxed">
              {subtitle}
            </p>
          )}
          {ctaText && (
            <div className="mt-8 flex flex-wrap gap-4 text-center">
              <a
                href={ctaLink || '#'}
                className="block w-full rounded bg-white px-12 py-3 text-sm font-medium text-blue-600 shadow hover:bg-gray-100 focus:outline-none focus:ring active:bg-gray-50 sm:w-auto"
              >
                {ctaText}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = ({ props }) => {
  const { title, subtitle, features = [], layout = 'grid' } = props;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
            {subtitle && <p className="mt-4 text-gray-600">{subtitle}</p>}
          </div>
        )}
        <div className={`grid gap-8 ${layout === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="block rounded-xl border border-gray-200 p-8 shadow-xl transition hover:border-pink-500/10 hover:shadow-pink-500/10"
            >
              {feature.icon && (
                <div className="text-4xl mb-4">{getIcon(feature.icon)}</div>
              )}
              <h3 className="mt-4 text-xl font-bold">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContentSection = ({ props }) => {
  const { content, maxWidth = '4xl' } = props;

  return (
    <section className="py-16">
      <div className={`mx-auto max-w-screen-${maxWidth} px-4 sm:px-6 lg:px-8`}>
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content || '' }}
        />
      </div>
    </section>
  );
};

const ContactSection = ({ props }) => {
  const {
    title,
    subtitle,
    email,
    phone,
    showMap = false,
  } = props;

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">{title || 'Contact Us'}</h2>
          {subtitle && <p className="mt-4 text-gray-600">{subtitle}</p>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="space-y-6">
              {email && (
                <div className="flex items-start gap-4">
                  <div className="text-2xl">📧</div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a
                      href={`mailto:${email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {email}
                    </a>
                  </div>
                </div>
              )}
              {phone && (
                <div className="flex items-start gap-4">
                  <div className="text-2xl">📞</div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <a
                      href={`tel:${phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your message"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTASection = ({ props }) => {
  const { title, text, buttonText, buttonLink } = props;

  return (
    <section className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 py-16">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-5xl">
            {title || 'Get Started Today'}
          </h2>
          {text && <p className="mt-4 text-lg text-white/90">{text}</p>}
          {buttonText && (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href={buttonLink || '#'}
                className="block w-full rounded-full border border-white bg-white px-12 py-3 text-sm font-medium text-pink-600 hover:bg-transparent hover:text-white focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
              >
                {buttonText}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const StatsSection = ({ props }) => {
  const { stats = [] } = props;

  const defaultStats = [
    { value: '1000+', label: 'Students' },
    { value: '50+', label: 'Courses' },
    { value: '95%', label: 'Success Rate' },
    { value: '24/7', label: 'Support' },
  ];

  const displayStats = stats.length > 0 ? stats : defaultStats;

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-5xl font-bold text-pink-600">{stat.value}</p>
              <p className="mt-2 text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Helper function to get icons
const getIcon = (iconName) => {
  const icons = {
    star: '⭐',
    shield: '🛡️',
    rocket: '🚀',
    heart: '❤️',
    check: '✓',
    lightning: '⚡',
    fire: '🔥',
    trophy: '🏆',
  };
  return icons[iconName] || '⭐';
};

// Main component that renders sections
const DynamicPageRenderer = ({ content }) => {
  if (!content || !content.sections || content.sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No content available</p>
      </div>
    );
  }

  const renderSection = (section, index) => {
    switch (section.type) {
      case 'hero':
        return <HeroSection key={section.id || index} props={section.props} />;
      case 'features':
        return <FeaturesSection key={section.id || index} props={section.props} />;
      case 'content':
        return <ContentSection key={section.id || index} props={section.props} />;
      case 'contact':
        return <ContactSection key={section.id || index} props={section.props} />;
      case 'cta':
        return <CTASection key={section.id || index} props={section.props} />;
      case 'stats':
        return <StatsSection key={section.id || index} props={section.props} />;
      default:
        return (
          <div key={section.id || index} className="py-8 bg-gray-100">
            <div className="max-w-screen-xl mx-auto px-4">
              <p className="text-gray-600">Unknown section type: {section.type}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dynamic-page">
      {content.sections.map((section, index) => renderSection(section, index))}
    </div>
  );
};

export default DynamicPageRenderer;
