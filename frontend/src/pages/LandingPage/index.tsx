
import {
  Link
} from "react-router-dom"

function LandingPage(props: any) {
  
    return (
      <>
        <div>
            <h1>Oi, sou uma landingPage</h1>
            <Link to="/login">Ir para login</Link>
        </div>
      </>
    )
}

export default LandingPage