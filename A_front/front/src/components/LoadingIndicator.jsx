import "../styles/LoadingIndicator.css"
import "../styles/Global.css"

const LoadingIndicator = () => {
    return (
        <div className="loading-container">
            <div className="loader"></div>
            <p className="loading-text">Загрузка...</p>
        </div>
    )
}

export default LoadingIndicator