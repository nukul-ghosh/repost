import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">
            Build Your Professional Reputation
          </h1>
          <p className="text-xl mb-12 text-primary-100 max-w-3xl mx-auto">
            A transparent platform to build verifiable resumes through timeline events,
            community endorsements, and project collaboration. Your professional story,
            backed by trusted connections.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-white mb-4">Timeline Resume</h3>
            <p className="text-primary-100">
              Build your professional story chronologically with verifiable events,
              skills, and achievements.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-white mb-4">Community Trust</h3>
            <p className="text-primary-100">
              Get endorsed by colleagues, managers, and organizations. Build reputation
              through transparent feedback.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-white mb-4">Project Collaboration</h3>
            <p className="text-primary-100">
              Link your work to projects and teams. Showcase real collaboration and
              contributions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
