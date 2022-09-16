import { Body, Inject, Injectable, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Organization,
  OrganizationDocument,
} from './Schema/organization.schema';
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk';
import {
  authenticationdata,
  createOrganizationDTO,
  resendVerificationCodeDTO,
  verificationCodeDTO,
} from './DTO/organization.dto';
import * as axios from 'axios';
import * as jwkToPem from 'jwk-to-pem';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool;
  private validateTokenURL = '';
  private cognitoTokenSignatureRes;
  private clientCognito;
  constructor(
    @InjectModel('organizations')
    private readonly orgModel: Model<OrganizationDocument>,
  ) {
    this.userPool = new CognitoUserPool({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      ClientId: process.env.COGNITO_CLIENT_ID,
    });
    this.validateTokenURL = `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
    this.clientCognito = new AWS.CognitoIdentityServiceProvider({
      apiVersion: '2016-04-19',
      region: process.env.COGNITO_REGION,
    });
  }

  async create_organization_DB(body) {
    console.log('INSIDE DB CREATE');
    return await this.orgModel.create(body);
  }
  async emailcheck(body) {
    return await this.orgModel.findOne({ organizationemailId: body });
  }

  async checkUserInDB(
    @Body()
    body: any,
    project = {},
  ) {
    return await this.orgModel.findOne(body, project);
  }

  async create_organization_cognito(
    @Body() body: createOrganizationDTO,
    organisationId: string,
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const { organizationName, organizationemailId, password } = body;
        console.log('CONGINTO_BODY', body);
        const attributeList = [];

        const organisation_IDnickname_attribute = {
          Name: 'address',
          Value: organisationId,
        };
        const role_attribute = {
          Name: 'profile',
          Value: 'superadmin',
        };
        const organizationemailId_attribute = {
          Name: 'email',
          Value: organizationemailId,
        };
        const organization_name_attribute = {
          Name: 'nickname',
          Value: organizationName,
        };
        const attribute_organization_id = new CognitoUserAttribute(
          organisation_IDnickname_attribute,
        );
        const attribute_organization_email_id = new CognitoUserAttribute(
          organizationemailId_attribute,
        );
        const attribute_role = new CognitoUserAttribute(role_attribute);
        const attribute_organization_name = new CognitoUserAttribute(
          organization_name_attribute,
        );

        attributeList.push(attribute_organization_id);
        attributeList.push(attribute_organization_email_id);
        attributeList.push(role_attribute);
        attributeList.push(attribute_organization_name);
        this.userPool.signUp(
          organizationemailId,
          password,
          attributeList,
          null,
          function (err, result) {
            if (err) {
              console.log('err', err);
              reject(err.message || JSON.stringify(err));
            } else {
              console.log('ORGANIZATION CREATED', result);
              resolve(result);
              return {
                StatusCode: 200,
                result: result,
                message: 'organization created',
              };
            }
          },
        );
      } catch (error) {
        await this.orgModel.findByIdAndDelete(organisationId);
        console.log('error_create_organization', error);
        reject(error);
      }
    });
  }

  update_user_cognito_ID(@Body() body: any, organizationID: string) {
    console.log('dsad>>', body);
    console.log('dsad>>', organizationID);
    // return  this.orgModel.findByIdAndUpdate(organizationID,{cognitoId:body})
    return this.orgModel
      .findByIdAndUpdate(
        organizationID,
        {
          $set: {
            cognitoId: body,
          },
        },
        { upsert: true, new: true },
      )
      .lean();
  }

  async verifyCode(@Body() body: verificationCodeDTO): Promise<any> {
    try {
      const { emailId, verificationCode } = body;

      const userData = {
        Username: emailId,
        Pool: this.userPool,
      };

      const cognitoUser = new CognitoUser(userData);

      return new Promise((resolve, reject) => {
        cognitoUser.confirmRegistration(
          verificationCode,
          true,
          function (err, result) {
            if (err) {
              reject(err.message);
            } else {
              resolve(result);
            }
          },
        );
      });
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  async authenticateAdmin(@Body() body: authenticationdata): Promise<any> {
    const { emailId, password } = body;
    console.log('inside authenticate admin', emailId, password);
    const authenticationDetails = new AuthenticationDetails({
      Username: emailId,
      Password: password,
    });

    const userData = {
      Username: emailId,
      Pool: this.userPool,
    };

    const newUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      newUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve(result);
          console.log('resultAdminSuccessfullAuthtendicateadminRes', result);
        },
        onFailure: (err) => {
          reject(err);
          console.log('resultAdminSuccessfullAuthtendicateADMinErr', err);
        },

        //   newPasswordRequired: function (userAttributes) {
        //     console.log("newPasswordRequired", userAttributes);
        //     delete userAttributes.email_verified;
        //     delete userAttributes.email
        //     newUser.completeNewPasswordChallenge(password, userAttributes, this);
        // }
      });
    });
  }

  async ConfirmUserSession(@Body() body): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const { accessToken, idToken, refreshToken, organizationemailId } =
          body;
        console.log('TOKEN', body);
        const AccessToken = new CognitoAccessToken({
          AccessToken: accessToken,
        });
        const IdToken = new CognitoIdToken({ IdToken: idToken });
        const RefreshToken = new CognitoRefreshToken({
          RefreshToken: refreshToken,
        });

        const sessionData = {
          IdToken: IdToken,
          AccessToken: AccessToken,
          RefreshToken: RefreshToken,
        };
        const userSession = new CognitoUserSession(sessionData);

        const userData = {
          Username: organizationemailId,
          Pool: this.userPool,
        };

        const cognitoUser = new CognitoUser(userData);
        cognitoUser.setSignInUserSession(userSession);

        cognitoUser.getSession(function (err, session) {
          // You must run this to verify that session (internally)
          if (session.isValid()) {
            // Update attributes or whatever else you want to do
            const result = { message: 'session is valid' };
            resolve(result);
          } else {
            // TODO: What to do if session is invalid?
            const result = { message: 'session is not valid' };
            resolve(result);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async resendVerifyCode(
    @Body() body: resendVerificationCodeDTO,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const { emailId } = body;

        const userData = {
          Username: emailId,
          Pool: this.userPool,
        };

        const cognitoUser = new CognitoUser(userData);

        cognitoUser.resendConfirmationCode(function (err, result) {
          if (err) {
            reject(err.message);
          }
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async validateToken(token: string): Promise<any> {
    /* 
      Test Caching of Cognito Keys ----> START
      ! IN TESTING MODE
    */
    let response = this.cognitoTokenSignatureRes;
    console.log('DASDASDASDSA??', response);
    if (!response) {
      response = await axios.default.get(this.validateTokenURL);
      this.cognitoTokenSignatureRes =
        response && response.status === 200 && response.data
          ? response
          : undefined;
    }else{
      return{
        statuscode:400
      }
    }
    /* 
        Test Caching of Cognito Keys ----> END
      */

    if (response && response.status === 200 && response.data) {
      console.log("<>>><><",response)
      console.log("<>>><><",response.data)

      try {
        return new Promise((resolve, reject) => {
          const pems = {};
          const keys = response.data['keys'];
          for (let i = 0; i < keys.length; i++) {
            const key_id = keys[i].kid;
            const modulus = keys[i].n;
            const exponent = keys[i].e;
            const key_type = keys[i].kty;
            const jwk = { kty: key_type, n: modulus, e: exponent };
            const pem = jwkToPem(jwk);
            pems[key_id] = pem;
          }
          const decodedJwt = jwt.decode(token, { complete: true });
          if (!decodedJwt) {
            reject('Session expired. Please login again.');
          }

          const kid = decodedJwt['header'].kid;
          const pem = pems[kid];
          if (!pem) {
            reject(new Error('Unknown token'));
          }

          jwt.verify(token, pem, (err, payload) => {
            if (err) {
              reject(new Error('Session expired. Please login again.'));
            } else {
              resolve({ valid: true, payload });
            }
          });
        });
      } catch (err) {
        throw new Error(err.message);
      }
    } else {
      throw new Error('Somethings Wrong');
    }
  }

  async createAdminonCognito(
    @Body() body: any,
    adminBody: any,
    organisationId: any,
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('adminBody', adminBody);
        console.log('UserBody');
        console.log('Body', body);

        var poolData = {
          UserPoolId: process.env.USER_POOL_ID,
          Username: body.emailId,
          DesiredDeliveryMediums: ['EMAIL'],
          TemporaryPassword: adminBody.tempPassword,
          UserAttributes: [
            {
              Name: 'email',
              Value: body.emailId,
            },
            {
              Name: 'custom:Role',
              Value: 'user',
            },

            {
              Name: 'email_verified',
              Value: 'true',
            },
            {
              Name: 'custom:adminSub',
              Value: adminBody.adminSub,
            },
            {
              Name: 'nickname',
              Value: organisationId,
            },
            {
              Name: 'name',
              Value: adminBody.adminOrg,
            },
            {
              Name: 'custom:adminID',
              Value: adminBody.adminId,
            },
          ],
        };
        this.clientCognito.adminCreateUser(poolData, (error, data) => {
          console.log('Cognito user areer', error);
          console.log('Pooldata', data);
          resolve({ data, status: 'User created on cogito success' });
        });
      } catch (error) {
        await this.orgModel.findByIdAndDelete(organisationId);
        reject(error);
      }
    });
  }
}
