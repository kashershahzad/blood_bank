#import "AppContacts.h"
#import <React/RCTBridgeModule.h>
#import <Contacts/Contacts.h>

@implementation AppContacts

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

RCT_EXPORT_METHOD(getAll:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  CNContactStore *store = [[CNContactStore alloc] init];
  [store requestAccessForEntityType:CNEntityTypeContacts
                  completionHandler:^(BOOL granted, NSError *error) {
                    if (!granted) {
                      reject(@"PERMISSION_DENIED", @"Contacts permission denied", error);
                      return;
                    }

                    NSError *fetchError = nil;
                    NSMutableArray *results = [NSMutableArray new];
                    NSMutableSet *seen = [NSMutableSet new];
                    NSArray *keys = @[
                      CNContactGivenNameKey,
                      CNContactFamilyNameKey,
                      CNContactPhoneNumbersKey
                    ];
                    CNContactFetchRequest *request =
                        [[CNContactFetchRequest alloc] initWithKeysToFetch:keys];

                    [store enumerateContactsWithFetchRequest:request
                                                       error:&fetchError
                                                  usingBlock:^(CNContact *contact, BOOL *stop) {
                      NSString *name =
                          [[NSString stringWithFormat:@"%@ %@", contact.givenName, contact.familyName]
                              stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
                      if (name.length == 0) {
                        name = @"Unknown";
                      }

                      for (CNLabeledValue<CNPhoneNumber *> *labeled in contact.phoneNumbers) {
                        NSString *number = labeled.value.stringValue ?: @"";
                        NSString *digits = [[number componentsSeparatedByCharactersInSet:
                            [[NSCharacterSet decimalDigitCharacterSet] invertedSet]]
                            componentsJoinedByString:@""];
                        if (digits.length == 0) {
                          continue;
                        }

                        NSString *key = [NSString stringWithFormat:@"%@|%@", name, digits];
                        if ([seen containsObject:key]) {
                          continue;
                        }
                        [seen addObject:key];
                        [results addObject:@{@"name" : name, @"phone" : digits}];
                      }
                    }];

                    if (fetchError) {
                      reject(@"FETCH_ERROR", fetchError.localizedDescription, fetchError);
                      return;
                    }

                    resolve(results);
                  }];
}

@end
