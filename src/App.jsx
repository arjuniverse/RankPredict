import { useState, useEffect } from 'react'
import './App.css'
import iitData from './data/iit.json'
import nitData from './data/nit.json'
import iiitData from './data/iiit.json'

function App() {
  const [formData, setFormData] = useState({
    examType: 'Main',
    rank: '',
    category: 'General',
    gender: 'Male',
    homeState: 'Delhi'
  })

  const [results, setResults] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [instituteFilter, setInstituteFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rank')

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal'
  ]

  const getChanceLevel = (cutoff, rank) => {
    if (!cutoff || !rank) return 'Low'
    const rankNum = parseInt(rank)
    const cutoffNum = parseInt(cutoff)
    if (rankNum <= cutoffNum * 0.7) return 'High'
    if (rankNum <= cutoffNum * 1.2) return 'Medium'
    return 'Low'
  }

  const getChanceColor = (level) => {
    switch (level) {
      case 'High': return '#10b981'
      case 'Medium': return '#f59e0b'
      case 'Low': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const predictColleges = () => {
    if (!formData.rank) {
      setResults([])
      setFilteredResults([])
      return
    }

    const rank = parseInt(formData.rank)
    if (isNaN(rank) || rank <= 0) {
      setResults([])
      setFilteredResults([])
      return
    }

    const allData = []
    
    if (formData.examType === 'Advanced') {
      iitData.forEach(college => {
        college.branches.forEach(branch => {
          const cutoff = branch.cutoffs?.[formData.category]?.[formData.gender] || branch.cutoffs?.[formData.category]?.All
          if (cutoff) {
            allData.push({
              institute: 'IIT',
              college: college.name,
              branch: branch.name,
              cutoff: cutoff,
              rank: rank,
              chance: getChanceLevel(cutoff, rank),
              location: college.location
            })
          }
        })
      })
    } else {
      const dataSources = [
        { data: nitData, type: 'NIT' },
        { data: iiitData, type: 'IIIT' }
      ]

      if (formData.examType === 'Main') {
        dataSources.forEach(({ data, type }) => {
          data.forEach(college => {
            college.branches.forEach(branch => {
              const stateCutoff = branch.cutoffs?.[formData.category]?.[formData.gender]?.[formData.homeState]
              const allIndiaCutoff = branch.cutoffs?.[formData.category]?.[formData.gender]?.['AllIndia']
              const cutoff = stateCutoff || allIndiaCutoff
              
              if (cutoff) {
                allData.push({
                  institute: type,
                  college: college.name,
                  branch: branch.name,
                  cutoff: cutoff,
                  rank: rank,
                  chance: getChanceLevel(cutoff, rank),
                  location: college.location,
                  isHomeState: !!stateCutoff
                })
              }
            })
          })
        })
      }
    }

    setResults(allData)
    setFilteredResults(allData)
  }

  useEffect(() => {
    predictColleges()
  }, [formData])

  useEffect(() => {
    let filtered = [...results]

    if (instituteFilter !== 'All') {
      filtered = filtered.filter(r => r.institute === instituteFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r => 
        r.college.toLowerCase().includes(query) ||
        r.branch.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query)
      )
    }

    if (sortBy === 'rank') {
      filtered.sort((a, b) => a.cutoff - b.cutoff)
    } else if (sortBy === 'college') {
      filtered.sort((a, b) => a.college.localeCompare(b.college))
    } else if (sortBy === 'chance') {
      const order = { High: 1, Medium: 2, Low: 3 }
      filtered.sort((a, b) => order[a.chance] - order[b.chance])
    }

    setFilteredResults(filtered)
  }, [instituteFilter, searchQuery, sortBy, results])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎓 RankPredict</h1>
        <p>JEE Rank to College Predictor</p>
      </header>

      <div className="container">
        <div className="form-section">
          <h2>Enter Your Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Exam Type</label>
              <select name="examType" value={formData.examType} onChange={handleInputChange}>
                <option value="Main">JEE Main</option>
                <option value="Advanced">JEE Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label>Rank</label>
              <input
                type="number"
                name="rank"
                value={formData.rank}
                onChange={handleInputChange}
                placeholder="Enter your rank"
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="General">General</option>
                <option value="OBC">OBC-NCL</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {formData.examType === 'Main' && (
              <div className="form-group">
                <label>Home State</label>
                <select name="homeState" value={formData.homeState} onChange={handleInputChange}>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="results-section">
          <div className="results-header">
            <h2>Possible Colleges ({filteredResults.length})</h2>
            <div className="controls">
              <div className="filter-group">
                <label>Institute:</label>
                <select value={instituteFilter} onChange={(e) => setInstituteFilter(e.target.value)}>
                  <option value="All">All</option>
                  <option value="IIT">IIT</option>
                  <option value="NIT">NIT</option>
                  <option value="IIIT">IIIT</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Sort:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="rank">By Cutoff</option>
                  <option value="college">By College</option>
                  <option value="chance">By Chance</option>
                </select>
              </div>
              <div className="search-group">
                <input
                  type="text"
                  placeholder="Search colleges, branches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="results-list">
            {filteredResults.length === 0 ? (
              <div className="no-results">
                {formData.rank ? 'No colleges found matching your criteria.' : 'Enter your rank to see predictions.'}
              </div>
            ) : (
              filteredResults.map((result, index) => (
                <div key={index} className="result-card">
                  <div className="result-header">
                    <div className="college-info">
                      <h3>{result.college}</h3>
                      <span className="institute-badge">{result.institute}</span>
                      {result.isHomeState && <span className="home-state-badge">Home State</span>}
                    </div>
                    <div 
                      className="chance-badge"
                      style={{ backgroundColor: getChanceColor(result.chance) }}
                    >
                      {result.chance} Chance
                    </div>
                  </div>
                  <div className="result-details">
                    <div className="detail-item">
                      <span className="label">Branch:</span>
                      <span className="value">{result.branch}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Location:</span>
                      <span className="value">{result.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Cutoff Rank:</span>
                      <span className="value">{result.cutoff.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Your Rank:</span>
                      <span className="value">{result.rank.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

