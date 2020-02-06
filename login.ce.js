Vue.component('login', {
    template: document.querySelector('#login'),
    mixins: [session],
    props: { mode: String, registerLink: String },
    data: function () {
        return {
            userName: '',
            email: '',
            password: '',
            valid: true,
            state: 'login',
            formValid:false,
            loginForm: {},
            busy:false,
        }
    },
    watch: {
        password: function(){
            let valid = true;
            if(this.loginForm){
                this.validation();
            }

        },
        validThrough: function (stamp) {
            this.expiration = new Date(stamp);
        }
    },
    mounted() {
        if(localStorage.validThrough){
            this.expiration = new Date(Number(localStorage.validThrough))
        }

        this.loginForm = this.$el.querySelector('form');
        // check if logged in
        if (this.token) {
            let now = new Date().getTime();
            if (now > this.expiration.getTime()) {
                this.logout();
                alert('Session expired');
            }

        }
    },
    methods: {
        validation(){
            let valid = true;
            let inputs = this.loginForm.getElementsByTagName('input');
            for(let input of inputs) {
                if(valid){
                    valid = input.validity.valid;
                }
            }
            this.formValid = valid;
        },
        logout: function () {
            ['token', 'validThrough', 'user'].forEach(prop => {
                delete localStorage[prop];
                this._data[prop] = null;
            });
            this.loggedIn = null;
            setTimeout(()=>{
                this.validation();
                this.$root.$emit('loggedIn', false);
            },100);
        },
        doLogin: async function () {
            this.busy = true;
            let obj = {password: this.password};
            if(this.mode === 'email'){
                obj.email = this.email;
            } else {
                obj.userName = this.userName;
            }

            api.post('login', obj).then(result => {
                ['token', 'validThrough', 'user'].forEach((prop) => {
                    localStorage.setItem(prop, JSON.stringify(result.data[prop]));
                    this._data[prop] = result.data[prop];
                });
                this.busy = false;
                this.$root.$emit('loggedIn', true);
            }).catch(err => {
                console.log(err);
                this.valid = false;
                this.busy = false;
            })
        }
    }

});
