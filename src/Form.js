import React from 'react'
import './Form.css'
import fetch from 'unfetch'
import * as _ from 'lodash'

const query = (cursor= undefined, username= 'Khaledgarbaya') => `
{
  user(login: "${username}") {
    pullRequests(last: 100 ${cursor ? `, before:"${cursor}"` : ""}) {
      pageInfo {
        startCursor
      }
      
      nodes {
        id  
        title
        createdAt
        repository {
          nameWithOwner
        }
      }
    }
  }
}
`
const gh = "https://api.github.com/graphql"
const runQuery = (query, username, token) => fetch(gh, {
  headers: {'Authorization': `bearer ${token}`},
  method: "POST",
  body: JSON.stringify({ query }) 
})
const allRepos = []
const iterate = (cursor, username, token, callback) => {
  const GQL = query(cursor, username)
  console.log("Calling:")
  runQuery(GQL, username, token).then(async r => {
    const response = await r.json()
    const prs = response.data.user.pullRequests
    let date = undefined
    const lastPR = prs.nodes[prs.nodes.length -1]
    if (lastPR) {
      date = new Date(lastPR.createdAt)
    }
    const repos = prs.nodes.map((n: any) => n.repository.nameWithOwner)
    allRepos.push(repos)
    
    if (date && date.getFullYear() === 2017) {
      const cursor = prs.pageInfo.startCursor
      iterate(cursor, username, token, callback)
    } else {
      done(callback)
    }
  }) 
}

const done = (callback) => {
 const flatRepos = _.flatten(allRepos)
 const grouped = _.groupBy(flatRepos, r => r)
 const uniques = Object.keys(grouped)
 const counters = uniques.map(m => ({ name: m, prs: grouped[m].length }))
 const sortedCounts = counters.sort((a , b) => a.prs > b.prs ? -1 : 1)

 const data = {
   info: {
     repos: {
      total: uniques.length,
      artsy: uniques.filter(f => f.startsWith("artsy")).length,
      cocoapods: uniques.filter(f => f.startsWith("CocoaPods")).length,
      danger: uniques.filter(f => f.startsWith("danger")).length,
      orta: uniques.filter(f => f.startsWith("orta")).length,
    },
    prs:{
      total: flatRepos.length,
      artsy: flatRepos.filter(f => f.startsWith("artsy")).length,
      cocoapods: flatRepos.filter(f => f.startsWith("CocoaPods")).length,
      danger: flatRepos.filter(f => f.startsWith("danger")).length,
      orta: flatRepos.filter(f => f.startsWith("orta")).length,
    }
   },
   repos: sortedCounts
 }
 callback(data)
}

class Form extends React.Component {
  constructor(params) {
    super(params)
    this.state = {username: '', token: '', total: undefined, repos: undefined}
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }
  getPullRequests () {
    iterate(undefined, this.state.username, this.state.token, (data) =>{
      this.setState({total: data.info.prs.total, repos: data.info.repos.total})
    })
  }
  handleChange (e) {
    this.setState({[e.target.name]: e.target.value})
  }
  handleSubmit (event) {
    this.getPullRequests()
    event.preventDefault()
  }
  render () {
    return (
      <div>
      <div id="login">
      <form id="login_form" onSubmit={this.handleSubmit}>
        <div className="field_container">
          <input type="text" name='username' placeholder="Github username" value={this.state.username} onChange={this.handleChange} />
        </div>
        <div className="field_container">
          <input type="text" name='token' placeholder="Github access token" value={this.state.token} onChange={this.handleChange}/>
        </div>
        <button id="sign_in_button">
            <span className="button_text">Submit</span>
        </button>
        <p> this is a static app nothing stored </p>
      </form>
      </div>
      <div className="result">
        {this.state.total && <h1>In 2017 you created: {this.state.total} Pull requests</h1>}
        {this.state.repos && <h1>In 2017 you contributed to: {this.state.repos} Repos</h1>}
      </div>
      </div>
    )
  }
}

export default Form
