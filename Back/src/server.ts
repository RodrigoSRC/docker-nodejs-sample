import 'dotenv/config'
import { AppDataSource } from "./data-source";
import { app } from './app';

AppDataSource.initialize()
  .then((): void => {
    console.log('Database Connected')

    const PORT: number = Number(process.env.PORT)
    app.listen(PORT, (): void => console.log(`App running at port ${PORT}`))
  })
  .catch((err)=> console.log(err))