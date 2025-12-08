import Head from 'next/head'
import { useState } from 'react'

export default function Home() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    eventDate: '',
    eventTime: '',
    guestCount: '',
    eventType: '',
    venue: '',
    specialRequests: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <>
      <Head>
        <title>That's Amore Catering | Professional Event Catering in Metairie</title>
        <meta name="description" content="Professional catering services for corporate events, parties, and special occasions. Pizza trays, pasta, appetizers, and complete meal packages available." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Logo/favicon.jpg" />
      </Head>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-dark mb-6">
            Catering That <span className="text-primary">Brings People Together</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Perfect for offices, parties, family gatherings, and special events. 
            Let us handle the food while you enjoy the celebration.
          </p>
          <div className="mt-8 mb-8">
            <img 
              src="/images/catering-setup.jpg" 
              alt="That's Amore Catering Setup" 
              className="w-full max-w-4xl mx-auto aspect-[4/3] object-cover rounded-2xl shadow-lg"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="#catering-form" 
              className="bg-primary text-white px-8 py-4 rounded-full text-xl font-medium hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
            >
              Get Catering Quote
            </a>
            <a 
              href="tel:504-454-5885" 
              className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-full text-xl font-medium hover:bg-primary hover:text-white transition-all duration-300"
            >
              Call for Catering
            </a>
          </div>
        </div>
      </section>

      {/* Catering Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-dark mb-4">
              Our <span className="text-primary">Catering Services</span>
            </h2>
            <p className="text-xl text-gray-600">From intimate gatherings to large corporate events</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Corporate Catering */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🏢</div>
                <h3 className="text-2xl font-heading font-bold text-blue-800 mb-2">Corporate Events</h3>
                <p className="text-blue-700">Professional catering for offices and businesses</p>
              </div>
              <ul className="space-y-3 text-blue-800">
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">✓</span>
                  Lunch meetings and conferences
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">✓</span>
                  Team building events
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">✓</span>
                  Client presentations
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">✓</span>
                  Holiday office parties
                </li>
              </ul>
            </div>

            {/* Private Parties */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border-2 border-green-200">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-heading font-bold text-green-800 mb-2">Private Parties</h3>
                <p className="text-green-700">Celebrate life's special moments</p>
              </div>
              <ul className="space-y-3 text-green-800">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Birthday celebrations
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Anniversary parties
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Family reunions
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Graduation parties
                </li>
              </ul>
            </div>

            {/* Special Events */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border-2 border-purple-200">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">💒</div>
                <h3 className="text-2xl font-heading font-bold text-purple-800 mb-2">Special Events</h3>
                <p className="text-purple-700">Make your event unforgettable</p>
              </div>
              <ul className="space-y-3 text-purple-800">
                <li className="flex items-center">
                  <span className="text-purple-600 mr-2">✓</span>
                  Weddings and receptions
                </li>
                <li className="flex items-center">
                  <span className="text-purple-600 mr-2">✓</span>
                  Baby showers
                </li>
                <li className="flex items-center">
                  <span className="text-purple-600 mr-2">✓</span>
                  Holiday celebrations
                </li>
                <li className="flex items-center">
                  <span className="text-purple-600 mr-2">✓</span>
                  Fundraising events
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Our Catering Menu */}
      <section id="catering-menu" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-dark mb-4">
              Our <span className="text-primary">Catering Menu</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From classic Italian favorites to custom creations, we offer a wide variety of options 
              to suit your event and dietary preferences.
            </p>
          </div>

          {/* Main Dishes */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-dark mb-6 text-center">Main Dishes</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src="/images/chicago-style-pizza.jpg" 
                  alt="Chicago Deep Dish Pizza" 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-6">
                  <h4 className="text-xl font-semibold mb-2">Chicago Deep Dish Pizza</h4>
                  <p className="text-gray-600 mb-4">Our signature thick-crust pizza with premium toppings and melted cheese.</p>
                  <p className="text-primary font-semibold">Starting at $15 per person</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src="/images/ny-style-pizza.jpg" 
                  alt="New York Style Pizza" 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-6">
                  <h4 className="text-xl font-semibold mb-2">New York Style Pizza</h4>
                  <p className="text-gray-600 mb-4">Thin, crispy crust with traditional toppings and authentic flavor.</p>
                  <p className="text-primary font-semibold">Starting at $12 per person</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src="/images/menu-items.jpg" 
                  alt="Pasta Dishes" 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-6">
                  <h4 className="text-xl font-semibold mb-2">Pasta Selection</h4>
                  <p className="text-gray-600 mb-4">Fettuccine Alfredo, Spaghetti Marinara, and more Italian classics.</p>
                  <p className="text-primary font-semibold">Starting at $10 per person</p>
                </div>
              </div>
            </div>
          </div>

          {/* Appetizers & Sides */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-dark mb-6 text-center">Appetizers & Sides</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-xl font-semibold mb-2">Garlic Bread & Breadsticks</h4>
                <p className="text-gray-600 mb-4">Fresh-baked bread with garlic butter and herbs.</p>
                <p className="text-primary font-semibold">$3 per person</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-xl font-semibold mb-2">Caesar Salad</h4>
                <p className="text-gray-600 mb-4">Fresh romaine lettuce with Caesar dressing and parmesan cheese.</p>
                <p className="text-primary font-semibold">$6 per person</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-xl font-semibold mb-2">Italian Antipasto</h4>
                <p className="text-gray-600 mb-4">Assorted Italian meats, cheeses, and marinated vegetables.</p>
                <p className="text-primary font-semibold">$8 per person</p>
              </div>
            </div>
          </div>

          {/* Beverages */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-dark mb-6 text-center">Beverages</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-xl font-semibold mb-2">Soft Drinks</h4>
                <p className="text-gray-600 mb-4">Coca-Cola, Sprite, Diet Coke, and more.</p>
                <p className="text-primary font-semibold">$2 per person</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-xl font-semibold mb-2">Iced Tea & Lemonade</h4>
                <p className="text-gray-600 mb-4">Fresh-brewed iced tea and homemade lemonade.</p>
                <p className="text-primary font-semibold">$2.50 per person</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-xl font-semibold mb-2">Coffee Service</h4>
                <p className="text-gray-600 mb-4">Regular and decaf coffee with cream and sugar.</p>
                <p className="text-primary font-semibold">$3 per person</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catering Form */}
      <section id="catering-form" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-dark mb-4">
              Request Your <span className="text-primary">Catering Quote</span>
            </h2>
            <p className="text-xl text-gray-600">Tell us about your event and we'll provide a custom quote</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  required
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Time *
                </label>
                <input
                  type="time"
                  id="eventTime"
                  name="eventTime"
                  required
                  value={formData.eventTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests *
                </label>
                <input
                  type="number"
                  id="guestCount"
                  name="guestCount"
                  min="1"
                  required
                  value={formData.guestCount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  required
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Event Type</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday Party</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="holiday">Holiday Party</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
                Venue/Location
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests or Dietary Restrictions
              </label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                rows="4"
                value={formData.specialRequests}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Please let us know about any special dietary requirements, allergies, or specific requests..."
              ></textarea>
            </div>
            
            <div className="text-center">
              <button
                type="submit"
                className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              >
                Request Quote
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}
