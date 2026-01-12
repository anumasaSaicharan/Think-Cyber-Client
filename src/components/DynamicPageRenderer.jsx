import React, { useState, useEffect } from 'react';

// ==============================================
// TEMPLATE A - Image ↔ Content Split (Multi-Row)
// ==============================================
const TemplateA = ({ content }) => {
  // Support both old single-row format and new multi-row format
  const rows = content.rows || [];
  
  // If no rows but has old format data, create a single row from it
  const displayRows = rows.length > 0 ? rows : (content.heading || content.image) ? [{
    layoutDirection: content.layoutDirection || 'IMAGE_LEFT',
    heading: content.heading || '',
    headingColor: content.headingColor || '#000000',
    subheading: content.subheading || '',
    subheadingColor: content.subheadingColor || '#666666',
    image: content.image || content.mainImage || '',
    content: content.bodyText || content.richTextContent || '',
    bulletPoints: content.bullets || content.bulletPoints || [],
    ctaText: content.ctaText || '',
    ctaLink: content.ctaLink || '',
  }] : [];

  if (displayRows.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-400">No content added yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {displayRows.map((row, index) => {
        const isImageLeft = row.layoutDirection === 'IMAGE_LEFT';
        const bulletPoints = Array.isArray(row.bulletPoints) 
          ? row.bulletPoints.map(b => typeof b === 'string' ? b : b?.text || '')
          : [];

        return (
          <section 
            key={row.id || index} 
            className={`py-16 lg:py-24 ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Heading & Subheading */}
              {(row.heading || row.subheading) && (
                <div className="text-center mb-12">
                  {row.heading && (
                    <h2 
                      className="text-3xl lg:text-4xl font-bold mb-3"
                      style={{ color: row.headingColor || '#000000' }}
                    >
                      {row.heading}
                    </h2>
                  )}
                  {row.subheading && (
                    <p 
                      className="text-lg lg:text-xl max-w-3xl mx-auto"
                      style={{ color: row.subheadingColor || '#666666' }}
                    >
                      {row.subheading}
                    </p>
                  )}
                </div>
              )}

              {/* Image-Content Split */}
              <div className={`flex flex-col ${isImageLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
                {/* Image Side */}
                <div className="w-full lg:w-1/2">
                  {row.image ? (
                    <img 
                      src={row.image} 
                      alt={row.heading || 'Section image'} 
                      className="w-full h-auto rounded-2xl shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2 space-y-6">
                  {row.content && (
                    <div 
                      className="prose prose-lg text-gray-600"
                      dangerouslySetInnerHTML={{ __html: row.content }}
                    />
                  )}

                  {bulletPoints.length > 0 && (
                    <ul className="space-y-3">
                      {bulletPoints.filter(b => b).map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">✓</span>
                          <span className="text-gray-700">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {row.ctaText && (
                    <a 
                      href={row.ctaLink || '#'}
                      className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
                    >
                      {row.ctaText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

// ==============================================
// TEMPLATE B - Clients Page + Blank Section
// ==============================================
const TemplateB = ({ content }) => {
  const {
    clients = [],
    blankSectionTitle = '',
    blankSectionContent = ''
  } = content;

  return (
    <div className="bg-white">
      {/* Clients Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Clients</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Trusted by leading organizations</p>
          </div>
          
          {clients && clients.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {clients.map((client, idx) => (
                <a 
                  key={idx}
                  href={client.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-50 rounded-xl p-6 flex items-center justify-center hover:shadow-lg transition aspect-square"
                >
                  {client.logo ? (
                    <img 
                      src={client.logo} 
                      alt={client.name || `Client ${idx + 1}`}
                      className="max-w-full max-h-24 object-contain group-hover:scale-110 transition"
                    />
                  ) : (
                    <span className="text-gray-400">{client.name || 'Client'}</span>
                  )}
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No clients added yet
            </div>
          )}
        </div>
      </section>

      {/* Blank Section */}
      {(blankSectionTitle || blankSectionContent) && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {blankSectionTitle && (
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 text-center">
                {blankSectionTitle}
              </h2>
            )}
            {blankSectionContent && (
              <div 
                className="prose prose-lg max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: blankSectionContent }}
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
};

// ==============================================
// TEMPLATE C - Banner Carousel + Content
// ==============================================
const TemplateC = ({ content }) => {
  const {
    banners = [],
    contentTitle = '',
    contentText = ''
  } = content;

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Auto-play carousel
  React.useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="bg-white">
      {/* Banner Carousel */}
      {banners && banners.length > 0 ? (
        <section className="relative w-full h-[400px] lg:h-[500px] overflow-hidden">
          {banners.map((banner, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-500 ${
                idx === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={banner.image} 
                alt={banner.caption || `Banner ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {banner.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
                  <p className="text-white text-xl lg:text-2xl font-semibold max-w-4xl mx-auto text-center">
                    {banner.caption}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition shadow-lg"
              >
                ‹
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition shadow-lg"
              >
                ›
              </button>
            </>
          )}

          {/* Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition ${
                    idx === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="w-full h-[300px] bg-gradient-to-r from-purple-200 via-purple-100 to-purple-200 flex items-center justify-center">
          <span className="text-gray-400">No banners added</span>
        </section>
      )}

      {/* Content Section */}
      {(contentTitle || contentText) && (
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {contentTitle && (
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
                {contentTitle}
              </h2>
            )}
            {contentText && (
              <div 
                className="prose prose-lg max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: contentText }}
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
};

// ==============================================
// TEMPLATE D - Visual / Gallery Page
// ==============================================
const TemplateD = ({ content }) => {
  // Support both field name formats for backward compatibility
  const galleryTitle = content.galleryTitle || '';
  const galleryDescription = content.galleryDescription || content.descriptionText || '';
  // Support both 'images' with 'url' field and 'galleryImages' with 'image' field
  const images = content.images || content.galleryImages || [];

  const [selectedImage, setSelectedImage] = useState(null);

  // Normalize image object to always have 'url' property
  const normalizeImage = (img) => ({
    url: img.url || img.image || '',
    caption: img.caption || ''
  });

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="py-12 lg:py-16 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {galleryTitle && (
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {galleryTitle}
            </h1>
          )}
          {galleryDescription && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {galleryDescription}
            </p>
          )}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {images && images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((imgRaw, idx) => {
                const img = normalizeImage(imgRaw);
                return (
                  <div 
                    key={idx}
                    className="group cursor-pointer"
                    onClick={() => setSelectedImage(img)}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl hover:shadow-xl transition">
                      <img 
                        src={img.url} 
                        alt={img.caption || `Gallery image ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    </div>
                    {img.caption && (
                      <p className="mt-2 text-sm text-gray-600 text-center">{img.caption}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              No images in gallery
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <div className="max-w-5xl max-h-[90vh]">
            <img 
              src={selectedImage.url} 
              alt={selectedImage.caption || 'Gallery image'}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {selectedImage.caption && (
              <p className="text-white text-center mt-4 text-lg">{selectedImage.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==============================================
// BLANK TEMPLATE - Simple content page
// ==============================================
const BlankTemplate = ({ content }) => {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {content?.title && (
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-center">
            {content.title}
          </h1>
        )}
        {content?.body && (
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        )}
      </div>
    </section>
  );
};

// ==============================================
// MAIN RENDERER COMPONENT
// ==============================================
const DynamicPageRenderer = ({ content, templateType }) => {
  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-600">No content available</p>
      </div>
    );
  }

  // Determine template type from content or prop
  const template = templateType || content.templateType || content.template_type || 'blank';

  switch (template) {
    case 'template_a':
      return <TemplateA content={content} />;
    case 'template_b':
      return <TemplateB content={content} />;
    case 'template_c':
      return <TemplateC content={content} />;
    case 'template_d':
      return <TemplateD content={content} />;
    case 'blank':
    default:
      return <BlankTemplate content={content} />;
  }
};

export default DynamicPageRenderer;
