const INITIAL_STATE = {
    checked_option: null,
    checked_option_value: null,
    checked_color: 'red',
    questionset: [],
    currentquestionset:null,
    currentquestion: null,
    app: null,
    title:null,
    results:[],
    history:[],
    spinning: true,
    patientName: "",
    MAP_V: null,
    MAP_H: null,
    painLocation:{
        front:new Set(),
        back:new Set(),
        left:new Set(),
        right:new Set(),
      }
};

export default (state=INITIAL_STATE, action) => {
    switch (action.type){
        case 'getAllQuestionSets':
            return {  ...state,
                questionset:action.payload.questionset,
                spinning: action.payload.spinning,
                patientName: action.payload.patientName
            };
        case 'startButtonClicked':
            return { ...state,
                currentquestionset:action.payload.currentquestionset,
                currentquestion:action.payload.currentquestion,
                app:action.payload.app,
                checked_option: null,
                checked_option_value: null,
                history: action.payload.history,
                results: action.payload.results
            };
        case 'displayCurrentQuestion':
            return { ...state, currentquestion:action.payload.currentquestion};
        case 'nextButtonClicked':
            return { ...state,
                results:action.payload.results,
                currentquestion:action.payload.currentquestion,
                checked_option:null,
                checked_option_value: null,
                history:action.payload.history
            };
        case 'backButtonClicked':
            return { ...state,
                results:action.payload.results,
                checked_option: null,
                checked_option_value: null,
                history: action.payload.history,
                currentquestion: action.payload.currentquestion
            };
        case 'lastQuestionReached':
            return { ...state, results:action.payload.results };
        case 'clearHistory':
            return { ...state,
                results: [],
                history: [],
                checked_option: null,
                checked_option_value: null,
            };
        case 'optionSelected' :
            return { ...state,
                checked_option:action.payload.checked_option,
                checked_option_value: action.payload.checked_option_value
            };
        case 'initialLayout':
            return { ...state,
                MAP_V: action.payload.MAP_V,
                MAP_H: action.payload.MAP_H
            };
        case 'updatePainLocation':
            return {...state,
              painLocation: action.payload.painLocation
            };

        default:
            return state;
    }
};
