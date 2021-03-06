import React, { Component } from 'react';
import { View, ListView, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { Button, ListItem, Right, Radio, Text} from 'native-base';

class QuestionList extends Component {

    onBackButtonPress(){
        if(this.props.results.length){ // problem: 这里写this.props.results为啥不行。。这样的话当results为null时会报错
            this.props.results.pop();
            this.props.history.pop();

            for(let question of this.props.currentquestionset){
                if(question.question._id == this.props.history[this.props.history.length-1]){
                    this.props.dispatch({
                        type: 'backButtonClicked',
                        payload: {
                            results: this.props.results,
                            currentquestion: question,
                            history: this.props.history,
                        }
                    });
                }
            }
        } else {
            this.props.dispatch({
                type: 'clearHistory',
                payload: {
                    results: [],
                    history: []
                }
            });
            Actions.welcome();
        }
    }

    onNextButtonPress(){
        if(this.props.currentquestion.end_question){
            this.props.results.push({
                q_id: this.props.currentquestion.question._id,
                key: this.props.checked_option,
                value: this.props.checked_option_value,
                description: this.props.currentquestion.question.description
            });
            this.props.dispatch({
                type: 'lastQuestionReached',
                payload: {
                    results: this.props.results
                }
            });
            Actions.submit();
        } else {
            for(let next of this.props.currentquestion.next_question){
                if(next.prerequisite.option == this.props.checked_option){
                    this.props.results.push({
                        q_id: this.props.currentquestion.question._id,
                        key: this.props.checked_option,
                        value: this.props.checked_option_value,
                        description: this.props.currentquestion.question.description
                    });

                    for(let question of this.props.currentquestionset){
                        if(question.question._id == next.question_id){
                            this.props.history.push(question.question._id);
                            this.props.dispatch({
                                type: 'nextButtonClicked',
                                payload: {
                                    results: this.props.results,
                                    currentquestion: question,
                                    history: this.props.history
                                }
                            });
                        }
                    }

                }
            }
        }
    }

    onChange = (key, value) => {
        this.props.dispatch({
            type: 'optionSelected',
            payload: {
                checked_option: key,
                checked_option_value: value
            }
        });
    };

    render() {
        // this is a problem for now: seems this page renders multiple times when gets back
        //console.log(this.props.history);
        const { titleStyle, buttonStyle } = styles;

        return(
            <View>
                <View>
                    <Text style={titleStyle}>
                        {this.props.currentquestion?this.props.currentquestion.question.description:"no question"}
                    </Text>
                </View>

                <View>
                    {this.props.currentquestion?this.props.currentquestion.question.options.map(i => {
                        return (

                            <ListItem key={i.key}>
                                <Text style={{width: '90%'}} onPress={() => this.onChange(i.key, i.value)}>{i.key}. {i.value}</Text>
                                <Radio radioSelectedColor="gray" radioColor="red" radioBtnSize="18" selected={this.props.checked_option == i.key}/>
                            </ListItem>

                        )
                        }):<ListItem>
                            <Text>
                                Not available.
                            </Text>
                            <Right>
                                <Radio selected={false}/>
                            </Right>
                        </ListItem>}
                </View>

                <View style={{flexDirection: 'row', flex: 1}}>
                    <Button warning onPress={this.onBackButtonPress.bind(this)} style={buttonStyle}>
                        <Text>Back</Text>
                    </Button>

                    <Button success onPress={this.onNextButtonPress.bind(this)} style={buttonStyle}>
                        <Text>Next</Text>
                    </Button>
                </View>
            </View>
        );
    }
}

const styles = {
    titleStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'left',
        padding: 15
    },

    buttonStyle: {
        flex: 0.4,
        margin: 5
    }
};

const mapStateToProps = state => {
    return {
        currentquestionset: state.questions.currentquestionset,
        questionset: state.questions.questionset,
        currentquestion: state.questions.currentquestion,
        checked_option : state.questions.checked_option,
        checked_option_value: state.questions.checked_option_value,
        results: state.questions.results,
        history:state.questions.history
    };
};

export default connect(mapStateToProps)(QuestionList);