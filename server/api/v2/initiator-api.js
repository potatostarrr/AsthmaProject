/**
 * Created by tengzhongwei on 6/13/17.
 */

let Initiator                   = require('../../models/initiator-model'),
    initiatorAuth               = require('../../utils/initiator-auth'),
    Joi                         = require('joi'),
    mongoose                    = require('mongoose'),
    filterPrivateInformation    = require('../../utils/filterPrivate'),
    Patient                     = require('../../models/patient-model'),
    QuestionSet                 = require('../../models/question-set-model'),
    bulk_update                 = require('../../service/bulk-update');

module.exports = async app => {
    /**
     * Get a Initiator's profile
     *
     * @return {object} Return profile object
     */
    app.get('/v2/initiators/profile', initiatorAuth, (req, res)=>{
        Initiator.findById(req.user.id)
            .populate('patients','first_name last_name')
            .exec((err,initiator)=>{
                if(err) res.status(500).send("Internal Database Error");
                else {
                    res.status(200).send({profile:filterPrivateInformation(initiator._doc)});
                }
            });

    });

    /**
     * Update a Initiator Profile
     *
     * @param {req.body.first_name}
     * @param {req.body.last_name}
     * @param {req.body.email}
     * @param {req.body.phone}
     * @return {object} Return profile object
     */
    app.patch('/v2/initiators/profile', initiatorAuth, (req, res)=>{
        let schema = Joi.object().keys({
            first_name: Joi.string().regex(/^[a-zA-Z]+$/).required(),
            last_name:  Joi.string().regex(/^[a-zA-Z]+$/).required(),
            email:      Joi.string().email().required(),
            phone:      Joi.string().regex(/^[0-9]{10}$/).required(),
        });
        Joi.validate(req.body, schema, (err, data) => {
            if (err) {
                const message = err.details[0].message;
                res.status(400).send({error: message});
            } else {
                Initiator.findByIdAndUpdate(req.user.id, {$set:data}, (err, initiator)=>{
                    if(err) {res.status(500).send({err})}
                    else{
                        if(initiator){
                            res.status(200).send(filterPrivateInformation({profile:initiator._doc}));
                        }
                        else {
                            res.status(400).send("Initiator doesn't exist")
                        }
                    }
                })
            }
        });
    });

    /**
     * Append/Add patients to Initiator
     *
     * @param {req.body.patients_id} list of id of patients
     * @return {object} Return success
     */
    app.patch('/v2/initiators/patients/add',initiatorAuth,(req, res)=>{
        let schema = Joi.object().keys({
            patients_id:Joi.array().items(Joi.number()).min(1).required(),
        });
        Joi.validate(req.body, schema, (err, data) =>{
            if (err) {
                const message = err.details[0].message;
                res.status(400).send({error: message});
            } else {
                bulk_update.addPatient(data.patients_id, req,res);
            }
        })
    });

    /**
     * Initiator append list of questions set to list of patients
     *
     * @param {req.body.patient_id} id of patient
     * @param {req.body.q_id} id of question set
     * @return {object} Return success
     */
    app.patch('/v2/initiators/patients/question-set', initiatorAuth, (req,res)=>{
        let schema = Joi.object().keys({
            patient_list: Joi.array().items(Joi.number()).required().min(1),
            q_list      : Joi.array().items(Joi.number()).required().min(1),
        });
        Joi.validate(req.body, schema, (err, data)=>{
            if (err) {
                const message = err.details[0].message;
                res.status(400).send({error: message});
            } else {
                bulk_update.addQuestionSet(req,res, data);
            }
        })


    });

    /**
     * Create a new patient in database
     *
     * @param {req.body.first_name}
     * @param {req.body.last_name}
     * @param {req.body.mrn}
     * @param {req.body.date_of_birth}
     * @return {200, {patient}} Return updated patient profile
     */
    app.post('/v2/initiators/patients/new', initiatorAuth, (req, res)=>{
        let schema = Joi.object().keys({
            first_name:         Joi.string().regex(/^[a-zA-Z]*$/).required(),
            last_name:          Joi.string().regex(/^[a-zA-Z]*$/).required(),
            mrn:                Joi.string().required(),
            date_of_birth:      Joi.date().required(),
        });
        Joi.validate(req.body, schema, (err,data)=>{
            if (err) {
                const message = err.details[0].message;
                res.status(400).send({error: message});
            } else {
                let patient = new Patient(data);

                patient.save(err=>{
                    console.log(err);
                    if(err) res.status(500).send('Error occurs when save data');
                    else {
                        res.status(200).send({patient});
                    }
                });

            }
        });
    });

    /**
     * Initiator update a patient profile.
     */
    app.patch('/v2/initiators/patients/:id/profile', initiatorAuth, (req,res)=>{
        let schema = Joi.object().keys({
            first_name:         Joi.string().regex(/^[a-zA-Z]*$/).required(),
            last_name:          Joi.string().regex(/^[a-zA-Z]*$/).required(),
            mrn:                Joi.string().required(),
            date_of_birth:      Joi.date().required(),
        });
        Joi.validate(req.body, schema, (err,data)=>{
            if (err) {
                const message = err.details[0].message;
                res.status(400).send({error: message});
            } else {
                Patient.findById(req.params.id, (err, patient)=>{
                   if(err)  res.status(500).send('Error occurs when query patient');
                   else{
                       if(patient){
                           patient.first_name = data.first_name;
                           patient.last_name = data.last_name;
                           patient.mrn = data.mrn;
                           patient.date_of_birth = data.date_of_birth;
                           patient.save(err=>{
                               if(err) res.status(500).send('Error occurs when save data');
                               else res.status(200).send({patient});
                           })
                       }
                       else  res.status(400).send('Patient does not exist');
                   }
                });
            }
        });
    })


};
