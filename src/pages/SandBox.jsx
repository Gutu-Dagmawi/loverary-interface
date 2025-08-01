import Card from '../components/Card'
const SandBox = ()=> {
    return(
        <div className="w-full h-full border-amber-500 flex justify-center items-center">
            <Card title="some title" author="some author" imageUrl="https://m.media-amazon.com/images/I/41ZY58-z4gL._UF1000,1000_QL80_.jpg" price="1.99" />
        </div>
    )
}

export default SandBox;