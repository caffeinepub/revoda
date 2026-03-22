import AccessControl "./authorization/access-control";
import AuthMixin "./authorization/MixinAuthorization";
import BlobMixin "./blob-storage/Mixin";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";

actor {
  // Authorization
  var _accessControlState = AccessControl.initState();
  include AuthMixin(_accessControlState);

  // Blob Storage
  include BlobMixin();

  // Report Type
  public type Report = {
    id : Text;
    category : Text;
    description : Text;
    gpsLat : Float;
    gpsLon : Float;
    clientTimestamp : Text;
    deviceId : Text;
    mediaKeys : [Text];
    anonymous : Bool;
    signatureData : Text;
    submittedAt : Int;
  };

  // Stable Storage
  var reports : Map.Map<Text, Report> = Map.empty();
  var reportCounter : Nat = 0;

  // Submit a new incident report (public)
  public shared func submitReport(
    category : Text,
    description : Text,
    gpsLat : Float,
    gpsLon : Float,
    clientTimestamp : Text,
    deviceId : Text,
    mediaKeys : [Text],
    anonymous : Bool,
    signatureData : Text
  ) : async Text {
    reportCounter += 1;
    let id = "RVD-" # reportCounter.toText();
    let report : Report = {
      id;
      category;
      description;
      gpsLat;
      gpsLon;
      clientTimestamp;
      deviceId;
      mediaKeys;
      anonymous;
      signatureData;
      submittedAt = Time.now();
    };
    reports.add(id, report);
    id
  };

  // Get total report count (public)
  public query func getReportCount() : async Nat {
    reports.size()
  };

  // Get all reports (admin only)
  public shared query ({ caller }) func getReports() : async [Report] {
    if (not AccessControl.isAdmin(_accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    reports.values().toArray()
  };

  // Get a single report by ID (admin only)
  public shared query ({ caller }) func getReport(id : Text) : async ?Report {
    if (not AccessControl.isAdmin(_accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    reports.get(id)
  };
}
