import axios from 'axios';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { User, UserDetails, DeleteUserResponse } from '@/store/modules/user/types';
import { Section } from '@/store/modules/sections/types';
import { Photo, UploadPhoto } from '@/store/modules/photos/types';
import { Party, PartyVotes } from '@/store/modules/parties/types';
import { Country } from '@/store/modules/countries/types';
import { Town } from '@/store/modules/towns/types';
import { ElectionRegion } from '@/store/modules/election-regions/types';
import { SendProtocolResponse, ProtocolResponse } from '@/store/modules/protocols/types';
import { SendViolationResponse, ViolationResponse } from '@/store/modules/violations/types';
import { Organization } from '@/store/modules/organizations/types';
import { StreamResponse } from '@/store/modules/streams/types';

export class ApiClient {

  private defaultConfig: AxiosRequestConfig = {
    baseURL: 'https://api-host-url',
    timeout: 30000,
    responseType: 'json',
    onUploadProgress: (progressEvent: ProgressEvent) => {
      const uploadPercentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);

      console.log(`upload: ${uploadPercentage}%`);
    },
    maxContentLength: 2000,
    maxBodyLength: 2000,
    validateStatus: (status: number) => status >= 200 && status < 300,
    maxRedirects: 5,
    withCredentials: true
  };

  private client: AxiosInstance;

  constructor() {
    this.client = axios.create(this.defaultConfig);
  }

  /**
   * Returns all organizations
   */
  getOrganizations(): Promise<Array<Organization>> {
    return new Promise((resolve, reject) => {
      this.client
        .get('/organizations')
        .then(response => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Create a new user
   *
   * @param user: User to be created
   *
   * @returns Registered user
   */
  createUser(user: User) {
    return new Promise((resolve, reject) => {
      const userData = {
        "firstName": user.userDetails.firstName,
        "lastName": user.userDetails.lastName,
        "email": user.userDetails.email,
        "phone": user.userDetails.phone,
        "pin": user.userDetails.pin,
        "organization": { "id": user.userDetails.organization?.id, "name": user.userDetails.organization?.name },
        "firebaseUid": user.firebaseUid,
        "hasAgreedToKeepData": user.userDetails.hasAgreedToKeepData
      };

      this.client
        .post('/users', userData, {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Update user details
   *
   * @param user: User to be created
   */
  updateUserDetails(user: User): Promise<UserDetails> {
    return new Promise((resolve, reject) => {
      const userData = {
        "firstName": user.userDetails.firstName,
        "lastName": user.userDetails.lastName,
        "email": user.userDetails.email,
        "phone": user.userDetails.phone,
        "pin": user.userDetails.pin,
        "organization": { "id": user.userDetails.organization?.id, "name": user.userDetails.organization?.name },
        "hasAgreedToKeepData": user.userDetails.hasAgreedToKeepData,
      };

      this.client
        .patch('/me', userData, {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Delete user profile
   *
   * @param user: Current user
   */
  deleteUser(user: User): Promise<DeleteUserResponse> {
    return new Promise((resolve, reject) => {
      this.client
        .delete('/me', {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          const result: DeleteUserResponse = { status: response.status };

          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get logged user details
   *
   * @param firebaseJwt: `Stored` user firebaseJwt
   *
   * @returns User details
   */
  getUserDetails(firebaseJwt: string): Promise<UserDetails> {
    return new Promise((resolve, reject) => {
      this.client
        .get('/me', {
          headers: {
            'Authorization': 'Bearer ' + firebaseJwt
          },
        })
        .then(response => {
          const userDetails: UserDetails = {
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            phone: response.data.phone,
            pin: response.data.pin,
            organization: response.data.organization,
            hasAgreedToKeepData: response.data.hasAgreedToKeepData
          };

          resolve(userDetails);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get all countries
   *
   * @param user: Current user
   * @param isAbroad: Is abroad?
   * 
   * @returns All countries
   */
  getCountires(user: User, isAbroad: boolean): Promise<Array<Country>> {
    return new Promise((resolve, reject) => {
      this.client
        .get('/countries', {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          const allCountries = response.data;

          if (isAbroad) {
            const index = allCountries.findIndex(function (el: Country) {
              return el.code === "00"; // remove Bulgaria
            });

            if (index > -1) {
              allCountries.splice(index, 1);
            }
          }

          const countries = allCountries.sort(function (lhs: Country, rhs: Country) {
            if (lhs.name < rhs.name) {
              return -1;
            }
            if (lhs.name > rhs.name) {
              return 1;
            }
            return 0;
          });

          resolve(countries);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get towns
   *
   * @param user: Current user
   * @param countryCode: The country code to filter by
   * @param electionRegionCode: The election region code to filter by
   * @param municipalityCode: The municipality code to filter by
   * @param isAbroad:
   *
   * @returns Matched towns
   */
  getTowns(
    user: User,
    countryCode: string,
    electionRegionCode?: string,
    municipalityCode?: string): Promise<Array<Town>> {

    return new Promise((resolve, reject) => {
      let params = {};

      if (electionRegionCode === null && municipalityCode === null) {
        params = {
          "country": countryCode
        };
      } else {
        if (electionRegionCode) {
          if (municipalityCode) {
            params = {
              "country": countryCode,
              "election_region": electionRegionCode,
              "municipality": municipalityCode
            };
          } else {
            params = {
              "country": countryCode,
              "election_region": electionRegionCode
            };
          }
        }
      }

      this.client
        .get('/towns', {
          params: params,
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          const towns = Array<Town>();

          for (const item in response.data) {
            towns.push({
              id: response.data[item].id,
              code: response.data[item].id,
              name: response.data[item].name,
              cityRegions: response.data[item].cityRegions
            });
          }

          const sortedTowns = towns.sort(function (lhs: Town, rhs: Town) {
            if (lhs.name < rhs.name) {
              return -1;
            }
            if (lhs.name > rhs.name) {
              return 1;
            }
            return 0;
          });

          resolve(sortedTowns);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get all election regions
   *
   * @param user: Current user
   * @param isAbroad: Is abroad?
   *
   * @returns All election regions
   */
  getElectionRegions(user: User, isAbroad: boolean): Promise<Array<ElectionRegion>> {
    return new Promise((resolve, reject) => {
      this.client
        .get('/election_regions', {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          const filteredRegions = response.data.filter(function (el: ElectionRegion) {
            return el.isAbroad === isAbroad;
          });

          const electionRegions = filteredRegions.sort(function (lhs: ElectionRegion, rhs: ElectionRegion) {
            if (lhs.code < rhs.code) {
              return -1;
            }
            if (lhs.code > rhs.code) {
              return 1;
            }
            return 0;
          });

          resolve(electionRegions);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get sections
   *
   * @param user: Current user
   * @param town: Selected town
   * @param cityRegion: City region if any
   *
   * @returns All election regions
   */
  getSections(user: User, town: number, cityRegion?: string): Promise<Array<Section>> {
    return new Promise((resolve, reject) => {
      let params = {};

      if (cityRegion === null) {
        params = { "town": town };
      } else {
        params = { "town": town, "city_region": cityRegion };
      }

      this.client
        .get('/sections', {
          params: params,
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          const sections = Array<Section>();

          for (const item in response.data) {
            sections.push({
              id: response.data[item].id,
              code: response.data[item].code,
              place: response.data[item].place,
              name: response.data[item].place
            });
          }

          const sortedSections = sections.sort(function (lhs: Section, rhs: Section) {
            if (lhs.code < rhs.code) {
              return -1;
            }
            if (lhs.code > rhs.code) {
              return 1;
            }
            return 0;
          });

          resolve(sortedSections);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get all parties
   *
   * @param user: Current user
   *
   * @returns All parties
   */
  getParties(user: User): Promise<Array<Party>> {
    return new Promise((resolve, reject) => {
      this.client
        .get('/parties', {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          const parties: Array<Party> = response.data;

          resolve(parties);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Upload image to cloud
   *
   * @param user: Current user
   * @param photo: Photo to upload
   *
   * @returns Upload photo info
   */
  uploadPhoto(user: User, photo: Photo): Promise<UploadPhoto> {
    return new Promise((resolve, reject) => {
      const pictureData = {
        "image": photo.data
      };

      this.client
        .post('/pictures', pictureData, {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          const uploadPhoto = {
            id: response.data.id,
            url: response.data.url,
            sortPosition: response.data.sortPosition,
            path: response.data.path,
            index: photo.index,
          };

          resolve(uploadPhoto);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Send protocol
   *
   * @param user: Current user
   * @param section: Selected section id
   * @param pictures: Protocol pictures ids
   *
   * @returns Sent protocol response
   */
  sendProtocol(user: User, sectionId: string, pictures: Array<string>): Promise<SendProtocolResponse> {
    return new Promise((resolve, reject) => {
      const data = {
        section: sectionId,
        pictures: pictures
      };

      this.client
        .post('/protocols', data, {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Send protocol results
   *
   * @param user: Current user
   * @param protocolId: The saved protocol id
   * @param votes: The party votes
   *
   * @returns Sent protocol response
   */
  sendResults(user: User, protocolId: string, votes: Array<PartyVotes>): Promise<SendProtocolResponse> {
    let validVotesCount = 0
    const results = votes.filter(result => {
      return result.party && result.party.id >= 0 && result.votes && result.votes >= 0
    }).map(result => {
      const votes = typeof result.votes === 'string' ? parseInt(result.votes, 10) : result.votes
      validVotesCount += votes ?? 0
      return {
        party: result.party?.id,
        validVotesCount: votes
      }
    })

    const data = {
      validVotesCount,
      results,
    };

    return this.client.post(`/protocols/${protocolId}/results`, data, {
      headers: { 'Authorization': 'Bearer ' + user.firebaseJwt },
    })
  }

  /**
   * Get protocols
   *
   * @param user: Current user
   *
   * @returns Users protocols response
   */
  getProtocols(user: User): Promise<Array<ProtocolResponse>> {
    return new Promise((resolve, reject) => {
      this.client
        .get('/me/protocols', {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          const protocols: Array<ProtocolResponse> = response.data;

          for (let i = 0; i < protocols.length; i++) {
            const protocol = protocols[i];
            protocol.statusColor = this.getStatusColor(protocol.status);
          }

          const sortedProtocols = protocols.sort(function (lhs: ProtocolResponse, rhs: ProtocolResponse) {
            if (lhs.id > rhs.id) {
              return -1;
            }
            if (lhs.id < rhs.id) {
              return 1;
            }
            return 0;
          });

          resolve(sortedProtocols);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get protocol
   *
   * @param user: Current user
   * @param id: Protocol id
   * 
   * @returns Users violations response
   */
   getProtocol(user: User, id: string): Promise<ProtocolResponse> {
    return new Promise((resolve, reject) => {
      this.client
        .get('/me/protocols', {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          const protocols = response.data.filter(function (el: ProtocolResponse) {
            return el.id === id;
          });

          if (protocols.length > 0) {
            resolve(protocols[0]);
          } else {
            reject();
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
  * Send violation
  *
  * @param user: Current user
  * @param town: Selected town
  * @param pictures: Protocol pictures ids
  * @param description: Violation description
  * @param section: Selected section
  *
  * @returns Sent violaton response
  */
  sendViolation(
    user: User,
    town: Town,
    pictures: Array<string>,
    description: string,
    section?: Section,
  ): Promise<SendViolationResponse> {
    return new Promise((resolve, reject) => {
      const data = {
        "section": section?.id,
        "town": town.id,
        "pictures": pictures,
        "description": description
      };

      this.client
        .post('/violations', data, {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get violations
   *
   * @param user: Current user
   *
   * @returns Users violations response
   */
  getViolations(user: User): Promise<Array<ViolationResponse>> {
    return new Promise((resolve, reject) => {
      this.client
        .get('/me/violations', {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          const violations: Array<ViolationResponse> = response.data;

          for (let i = 0; i < violations.length; i++) {
            const violation = violations[i];
            violation.statusColor = this.getStatusColor(violation.status);
          }

          const sortedViolations = violations.sort(function (lhs: ViolationResponse, rhs: ViolationResponse) {
            if (lhs.id > rhs.id) {
              return -1;
            }
            if (lhs.id < rhs.id) {
              return 1;
            }
            return 0;
          });

          resolve(sortedViolations);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get violation
   *
   * @param user: Current user
   * @param id: Violation id
   * 
   * @returns Users violations response
   */
   getViolation(user: User, id: string): Promise<ViolationResponse> {
    return new Promise((resolve, reject) => {
      this.client
        .get('/me/violations', {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          const violations = response.data.filter(function (el: ViolationResponse) {
            return el.id === id;
          });

          if (violations.length > 0) {
            resolve(violations[0]);
          } else {
            reject();
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
  * Send stream
  *
  * @param user: Current user
  * @param section: Selected section
  *
  * @returns Sent stream response
  */
  sendStartStream(user: User, section?: Section): Promise<StreamResponse> {
    return new Promise((resolve, reject) => {
      const data = { "section": section?.id, };

      this.client
        .post('/streams', data, {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
  * Send push notifications registration token
  *
  * @param user: Current user
  * @param token: Firebase push notifications registration token
  *
  * @returns 
  */
  sendAPNToken(user: User, token: string) {
    return new Promise((resolve, reject) => {
      const data = { "token": token, };

      this.client
        .post('/me/clients', data, {
          headers: {
            'Authorization': 'Bearer ' + user.firebaseJwt
          },
        })
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Private methods
   */

  private getStatusColor(status: string): string {
    switch (status) {
      case "received":
        return "#FF9900";
      case "rejected":
        return "#FF0000";
      case "approved":
        return "#4CAF50";
      case "processed":
        return "#4CAF50";
      default:
        return "#666666";
    }
  }
}
