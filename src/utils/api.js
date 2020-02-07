export const callApi = async (url, options = {}) => {
  const {
    json = true,
    params = {},
    shouldBuildUrl = true,
    method = 'GET'
  } = options
  // let headers = {
  //   'Authorization': `Bearer ${this.props.token}`
  // }
  let headers = {}

  if(json){
    headers = {
      ...headers,
      Accept: 'application/json',
        'Content-Type': 'application/json',
    }
  }else{
    if(options.body){
      let formBody = new FormData();
      for ( var key in options.body ) {
        formBody.append(key, options.body[key]);
      }

      options.body = formBody;
    }
  }

  //  Add URL parameters
  const fullURL = shouldBuildUrl ? new URL(`${process.env.REACT_APP_API_ENDPOINT}${url}`) : new URL(url);
  Object.keys(params).forEach(key => fullURL.searchParams.append(key, params[key]))

  try{
    const response = await fetch(fullURL,{
      ...options,
      method,
      headers
    })

    const body = await response.json()

    return {
      status: response.status,
      body
    }
  }catch(e){
    //  Return to login page if the request fail with 401
    if(e.status === 401){
      alert(e.message)
    }else{
      throw e.message
    }
  }
}