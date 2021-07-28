import React, {Component} from 'react';
import Navigation from './components/Navigation/Navigation.js';
import Signin from './components/Signin/Signin.js';
import Register from './components/Register/Register.js';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Particles from 'react-particles-js';
import './App.css';


const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 250
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl:'',
  box: {},
  route: 'signin',
isSignedIn: false,
  user: {
    id: '',
    name: '',
    entries: 0,
    joined: new Date()
  }
}
// start of class
class App extends Component {

  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }
    })
  }

  // bounding box
  calculateFaceLocation = (data) => {
      const calrifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
      const image = document.getElementById('inputimage');
      const width = Number(image.width);
      const height = Number(image.height);
      return {
        leftCol: calrifaiFace.left_col * width,
        topRow: calrifaiFace.top_row * height,
        rightCol: width - (calrifaiFace.right_col * width),
        bottomRow: height - (calrifaiFace.bottom_row * height)
      }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }
// event listeners
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
        fetch('https://mighty-caverns-02664.herokuapp.com/imageurl',{
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
              input: this.state.input
        })
      })
      .then(response => response.json())
      .then(response => {
        if(response) {
          fetch('https://mighty-caverns-02664.herokuapp.com/image',{
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {
            entries: count
          }))
        })
        .catch(console.log)
      }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState(initialState)
    } else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }
  // render function
  render () { 
    const { isSignedIn, imageUrl, route, box, } = this.state;
    const { name, entries} = this.state.user
      return (
        <div className="App">
          
          <Particles className='particles'
            params={particlesOptions}
          />
          <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
          { route === 'home' 
          ? <div> 
              <Logo />
              <Rank name={name} entries={entries}/>
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onButtonSubmit={this.onButtonSubmit} 
                />
              <FaceRecognition box={box} imageUrl={imageUrl}/>  
          </div>
          : (
            route === 'signin' 
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
          }
        </div>
          
    );
  }
}

export default App;
