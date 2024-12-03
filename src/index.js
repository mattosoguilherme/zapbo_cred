
const express = require("express");
const app = express();
const port = 3000 || process.env.PORT;
const bodyParser = require("body-parser");
const Routers = require("../src/routes/message.routes");
const YAML = require("yamljs");
const swagger = require("swagger-ui-express");
const path = require("path");
const { connect } = require("../src/config/baileys.client");

const teste = path.join(__dirname, "../src/swagger.yaml");

const swaggerDocument = YAML.load(teste);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", Routers);
app.use("/api", swagger.serve, swagger.setup(swaggerDocument));

connect();
app.listen(port, () => {
  console.log(`           
    
                                                                                                                                             
                                                                                                                                            
                                                                mmMMMMMMMMMMMMmm                                                            
                                                            MMMMMMMMMMMMMMMMMMMMMMMM                                                        
                                                        MMMMMMMM                MMMMMMMM                                                    
                                                      MMMMMM          MMMM          MMMMMM                                                  
                                                    MMMM      mmMMMMMMMMMMMMMMMM::      MMMM                                                
                                                  MMMM      MMMMMMMMMMMMMMMMMMMMMMMM      MMMM                                              
                                                MMMM      MMMMMMMMMMMMMMMMMMMMMMMMMMMM    mmMMMM                                            
                                                MMMM    MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM    MMMM                                            
                                              MMMM    MMMMMMMM      MMMMMMMMMMMMMMMMMMMMMM    MMmm                                          
                                              MMMM    MMMMMMMM      mmMMMMMMMMMMMMMMMMMMMM    MMMM                                          
                                              MM..  MMMMMMMMMM        MMMMMMMMMMMMMMMMMMMMMM  MMMM                                          
                                            mmMM    MMMMMMMMMM      MMMMMMMMMMMMMMMMMMMMMMMM    MM                                          
                                            MMMM    MMMMMMMMMM      MMMMMMMMMMMMMMMMMMMMMMMM    MM::                                        
                                            MMMM    MMMMMMMMMMMM    MMMMMMMMMMMMMMMMMMMMMMMM    MMMM                                        
                                            MMMM    MMMMMMMMMMMM      MMMMMMMMMMMMMMMMMMMMMM    MMMM                                        
                                            MMMM    MMMMMMMMMMMMMM      MMMM  mmMMMMMMMMMMMM    MM                                          
                                              MM    MMMMMMMMMMMMMM--              MMMMMMMMMM  mmMM                                          
                                              MMMM  ..MMMMMMMMMMMMMM--            MMMMMMMM    MMMM                                          
                                              MMMM    MMMMMMMMMMMMMMMMMM          MMMMMMMM    MMMM                                          
                                                MMMM    MMMMMMMMMMMMMMMMMMMM    MMMMMMMM    MMMM                                            
                                                MMMM    mmMMMMMMMMMMMMMMMMMMMMMMMMMMMM--    MMMM                                            
                                                  MMMM    mmMMMMMMMMMMMMMMMMMMMMMMMM      MMMM                                              
                                                  MMMMMM      MMMMMMMMMMMMMMMMMMMM      MMMM                                                
                                                MMMMMMMMMM        mmMMMMMMMM--        MMMM                                                  
                                                MMMMMMMMMMMMMM                    MMMMMM                                                    
                                              MMMMMMMMMMMMMMMMMMMMMMMM::::MMMMMMMMMMMM                                                      
                                              MMMMMMMMMM      ++MMMMMMMMMMMMMMMM                                                            
                                                ::                                                                                          
                                                                                                                                            
                                                                                                                                            
        ########    ##########  ##++    ##  ########          ##            ##########  ##    ####@@##########  ########        ##          
        ##    ####  ##    @@##  ####    ##  ####::####      ######          ##    ####  ##    ############  ##::##    ####    ######        
      --##    ####  ##          ######  ##  ##      ####    ##  ##          ##          ####  ##        ##    ++##    ####    ##  ##        
      ::######--    ########    ##  ##  ##  ##      --##  ####  ####      ++########      ####::        ##    ########      ####  ####      
      ####  ####    ##          ##  ######  ##      ####  ##########      MM##          ####  ####    MM##    ####  ####    ##########      
      ####    ####  ##      ##  ##    ####  ####  MM####  ##      ##      @@##      ##  ##    ####    @@##    ####    ####  ##      ##      
      ####    ####  ##########  ##      ##  ##########  ####      ##++    @@##############      ##    ####    ####    ########      ####    
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
              ##########      ##      ########    ########        ####              ######    ########    ##########  ######                
              ##::####::    ######    ##MM  @@##  ##    --##    ##########        ####::####  ##::::####  ####..####  ##########            
                  ####      ##  ##    ##      ##  ##      ##  ####      ##      mm##      ##  ##    ++##  ##          ##      ##            
                ####      ####  ##    ##########  ########    ####      ##      ####          ########    ########    ##      ####          
              ####        ####  ####  ##..        ##      ##..####      ##      ####          ##  ####    ##          ##      ####          
              ##      ##  ##      ##  ##          ##      ########    ####        ##..    ##++##    ####  ##      ##  ##    @@##            
            ################      ##  ####        ##########    ########          ::########mm##    ####  ##########  ##########            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
                                                                                                                                            
    
    app rodando na porta: http://localhost:${port}/api`);
});
