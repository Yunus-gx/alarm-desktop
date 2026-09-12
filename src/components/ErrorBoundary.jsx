import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(){
    return { hasError: true }
  }

  componentDidCatch(error){
    console.error('App crashed in ErrorBoundary', error)
  }

  render(){
    if(this.state.hasError){
      return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex items-center justify-center">
          <div className="max-w-lg w-full rounded-xl bg-white/5 border border-white/10 p-6">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-slate-300 mt-2">The app hit an unexpected error. Please refresh the page.</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
